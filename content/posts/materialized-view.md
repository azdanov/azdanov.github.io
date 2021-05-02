---
title: 'Materialized Views in a Database'
date: 2019-03-10T12:58:12.475Z
description: 'Using a materialized view to speedup queries in PostgreSQL and MySQL.'
tags:
  - SQL
  - PostgreSQL
  - MySQL
  - Trivia
image: '/img/study.png'
---

For example there is a dashboard for a fictitious logistics company, they have a multitude of workers, each frequently visiting the website.

![Page](/img/page.png)

But there is a problem. The summary page that is found on the `/` route needs to execute a heavy query on each visit, which slows everything down. Not to mention the lack of reusability when embedding the summary SQL code inside the app.

```sql
-- Employee Leaderboard
SELECT
  concat(e.firstname, ' ', e.lastname) AS name,
  sum(od.price * od.quantity) AS amount
FROM
  employee AS e
  INNER JOIN order AS o ON o.employeeid = e.id
  INNER JOIN orderdetail AS od ON od.orderid = o.id
GROUP BY
  e.id
ORDER BY
  amount DESC
LIMIT
  5;

-- Customer Leaderboard
SELECT
  c.company AS name,
  sum(od.price * od.quantity) AS amount
FROM
  customer AS c
  INNER JOIN order AS o ON o.customerid = c.id
  INNER JOIN orderdetail AS od ON od.orderid = o.id
GROUP BY
  c.id
ORDER BY
  amount DESC
LIMIT
  5;

-- Product Leaderboard
SELECT
  p.product AS name, sum(od.price * od.quantity) AS amount
FROM
  orderdetail AS od
  INNER JOIN order AS o ON o.id = od.orderid
  INNER JOIN product AS p ON p.id = od.productid
GROUP BY
  p.id
ORDER BY
  amount DESC
LIMIT
  5;

-- Recent Orders
SELECT
  o.id,
  concat(e.firstname, ' ', e.lastname) AS employee,
  c.company AS customer,
  o.date,
  sum(od.price * od.quantity) AS amount
FROM
  order AS o
  INNER JOIN orderdetail AS od ON od.orderid = o.id
  INNER JOIN employee AS e ON e.id = o.employeeid
  INNER JOIN customer AS c ON c.id = o.customerid
WHERE
  o.date IS NOT NULL
GROUP BY
  o.id, e.firstname, e.lastname, c.company
ORDER BY
  o.date DESC
LIMIT
  5;

-- Product Reorder list
SELECT
  product AS name, reorderthreshold, unitsinstock, unitsordered
FROM
  product
WHERE
  (unitsinstock + unitsordered) < reorderthreshold;
```

Let's move this query inside the database as a [MATERIALIZED VIEW](https://www.postgresql.org/docs/current/rules-materializedviews.html).

## Refactor to PostgreSQL Materialized View

PostgreSQL natively supports `MATERIALIZED VIEW`, which will simplify things a lot. The queries stay basically the same, so it's a simple refactor.

One problem one might encounter is a need to manually refresh the views, which can be solved with [TRIGGER](https://www.postgresql.org/docs/current/plpgsql-trigger.html).

```sql
-- Employee Leaderboard
CREATE MATERIALIZED VIEW mv_employeeleaderboard
AS
SELECT
  concat(e.firstname, ' ', e.lastname) AS name,
  sum(od.price * od.quantity) AS amount
FROM
  employee AS e
  INNER JOIN order AS o ON o.employeeid = e.id
  INNER JOIN orderdetail AS od ON o.id = od.orderid
  GROUP BY
    e.id
  ORDER BY
    amount DESC
  LIMIT 5;

-- Customer Leaderboard
CREATE MATERIALIZED VIEW mv_customerleaderboard
AS
SELECT
  c.company AS name,
  sum(od.price * od.quantity) AS amount
FROM
  customer AS c
  INNER JOIN order AS o ON o.customerid = c.id
  INNER JOIN orderdetail AS od ON o.id = od.orderid
  GROUP BY
    c.id
  ORDER BY
    amount DESC
  LIMIT 5;

-- Product Leaderboard
CREATE MATERIALIZED VIEW mv_productleaderboard
AS
SELECT
  p.product AS name,
  sum(od.price * od.quantity) AS amount
FROM
  orderdetail AS od
  INNER JOIN order AS o ON od.orderid = o.id
  INNER JOIN product AS p ON od.productid = p.id
  GROUP BY
    p.id
  ORDER BY
    amount DESC
  LIMIT 5;

-- Recent Orders
CREATE VIEW mv_recentorders
AS
SELECT
  o.id,
  concat(e.firstname, ' ', e.lastname) AS employee,
  c.company AS customer,
  o.date,
  sum(od.price * od.quantity) AS subtotal
FROM
  order AS o
  INNER JOIN orderdetail AS od ON od.orderid = o.id
  INNER JOIN employee AS e ON o.employeeid = e.id
  INNER JOIN customer AS c ON o.customerid = c.id
  WHERE
    o.date IS NOT NULL
  GROUP BY
    o.id,
    e.firstname,
    e.lastname,
    c.company
  ORDER BY
    o.date DESC
  LIMIT 5;

-- Product Reorder list (VIEW is used to keep it up-to-date)
CREATE VIEW v_reorderlist
SELECT
  product AS name, reorderthreshold, unitsinstock, unitsordered
FROM
  product
WHERE
  (unitsinstock + unitsordered) < reorderthreshold;
```

Now let's create some [TRIGGER](https://www.postgresql.org/docs/current/plpgsql-trigger.html)s and a [FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html) that will refresh created views on `order` update or delete.

```sql
CREATE OR REPLACE FUNCTION refresh_dashboard()
  RETURNS TRIGGER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_employeeleaderboard;
  REFRESH MATERIALIZED VIEW mv_customerleaderboard;
  REFRESH MATERIALIZED VIEW mv_productleaderboard;
  REFRESH MATERIALIZED VIEW mv_recentorders;
  RETURN new;
END;
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER dashboard_refresh_for_order_update
AFTER UPDATE
  ON order FOR EACH ROW EXECUTE PROCEDURE refresh_dashboard();

CREATE TRIGGER dashboard_refresh_for_order_delete
AFTER DELETE
  ON order FOR EACH ROW EXECUTE PROCEDURE refresh_dashboard();
```

These statements can be entered directly via a terminal into a database, or even better inserted by a migration.

It is easy to revert introduced changes with these statements.

```sql
DROP MATERIALIZED VIEW mv_employeeleaderboard;
DROP MATERIALIZED VIEW mv_customerleaderboard;
DROP MATERIALIZED VIEW mv_productleaderboard;
DROP MATERIALIZED VIEW mv_recentorders;
DROP VIEW v_reorderlist;

DROP TRIGGER dashboard_refresh_for_order_update ON order;
DROP TRIGGER dashboard_refresh_for_order_delete ON order;
```

## Refactor to MySQL Materialized View Hack

Sadly MySQL doesn't have `MATERIALIZED VIEW`, what we could do is create a specialized table only used for the dashboard and manually update it's data.

First step is to encapsulate each query inside of a dedicated `VIEW`.

```sql
-- Employee Leaderboard
CREATE OR REPLACE VIEW v_employeeleaderboard
AS (
  SELECT
    concat(e.firstname, ' ', e.lastname) AS name,
    sum(od.price * od.quantity) AS amount
  FROM
    employee AS e
  INNER JOIN order AS o ON o.employeeid = e.id
  INNER JOIN orderdetail AS od ON o.id = od.orderid
  GROUP BY
    e.id
  ORDER BY
    amount DESC
  LIMIT 5);

-- Customer Leaderboard
CREATE OR REPLACE VIEW v_customerleaderboard
AS (
  SELECT
    c.company AS name,
    SUM(od.price * od.quantity) AS amount
  FROM
    customer AS c
  INNER JOIN order AS o ON o.customerid = c.id
  INNER JOIN orderdetail AS od ON o.id = od.orderid
  GROUP BY
    c.id
  ORDER BY
    amount DESC
  LIMIT 5);

-- Product Leaderboard
CREATE OR REPLACE VIEW v_productleaderboard
AS (
  SELECT
    p.product AS name,
    sum(od.price * od.quantity) AS amount
  FROM
    orderdetail AS od
  INNER JOIN order AS o ON od.orderid = o.id
  INNER JOIN product AS p ON od.productid = p.id
  GROUP BY
    p.id
  ORDER BY
    amount DESC
  LIMIT 5);

-- Recent Orders
CREATE OR REPLACE VIEW v_recentorders
AS (
  SELECT
    o.id,
    concat(e.firstname, ' ', e.lastname) AS employee,
    c.company AS customer,
    o.date,
    sum(od.price * od.quantity) AS amount
  FROM
    order AS o
  INNER JOIN orderdetail AS od ON od.orderid = o.id
  INNER JOIN employee AS e ON o.employeeid = e.id
  INNER JOIN customer AS c ON o.customerid = c.id
  WHERE
    o.date IS NOT NULL
  GROUP BY
    o.id,
    e.firstname,
    e.lastname,
    c.company
  ORDER BY
    o.date DESC
  LIMIT 5);

-- Product Reorder list (VIEW is used to keep it up-to-date)
CREATE OR REPLACE VIEW v_reorderlist
SELECT
  product AS name, reorderthreshold, unitsinstock, unitsordered
FROM
  product
WHERE
  (unitsinstock + unitsordered) < reorderthreshold;
```

Next is to create a `TABLE` that will imitate `MATERIALIZED VIEW`.

```sql
CREATE TABLE mv_employeeleaderboard AS
SELECT * FROM v_employeeleaderboard;

CREATE TABLE mv_customerleaderboard AS
SELECT * FROM v_customerleaderboard;

CREATE TABLE mv_productleaderboard AS
SELECT * FROM v_productleaderboard;

CREATE TABLE mv_recentorders AS
SELECT * FROM v_recentorders;

CREATE TRIGGER dashboard_refresh_for_order_update
AFTER UPDATE
  ON order FOR EACH ROW
BEGIN
  DELETE FROM mv_employeeleaderboard;
  DELETE FROM mv_customerleaderboard;
  DELETE FROM mv_productleaderboard;
  DELETE FROM mv_recentorders;

  INSERT INTO mv_employeeleaderboard
  SELECT * FROM v_employeeleaderboard;

  INSERT INTO mv_customerleaderboard
  SELECT * FROM v_customerleaderboard;

  INSERT INTO mv_productleaderboard
  SELECT * FROM v_productleaderboard;

  INSERT INTO mv_recentorders
  SELECT * FROM v_recentorders;
END;

CREATE TRIGGER dashboard_refresh_for_delete
AFTER DELETE
  ON order FOR EACH ROW
BEGIN
  DELETE FROM mv_employeeleaderboard;
  DELETE FROM mv_customerleaderboard;
  DELETE FROM mv_productleaderboard;
  DELETE FROM mv_recentorders;

  INSERT INTO mv_employeeleaderboard
  SELECT * FROM v_employeeleaderboard;

  INSERT INTO mv_customerleaderboard
  SELECT * FROM v_customerleaderboard;

  INSERT INTO mv_productleaderboard
  SELECT * FROM v_productleaderboard;

  INSERT INTO mv_recentorders
  SELECT * FROM v_recentorders;
END;
```

And to revert the changes.

```sql
DROP VIEW v_employeeleaderboard;
DROP VIEW v_customerleaderboard;
DROP VIEW v_productleaderboard;
DROP VIEW v_recentorders;
DROP VIEW v_reorderlist;

DROP TABLE IF EXISTS mv_customerleaderboard;
DROP TABLE IF EXISTS mv_employeeleaderboard;
DROP TABLE IF EXISTS mv_productleaderboard;
DROP TABLE IF EXISTS mv_recentorders;

DROP TRIGGER IF EXISTS dashboard_refresh_for_order_update;
DROP TRIGGER IF EXISTS dashboard_refresh_for_order_delete;
```

## Final

In the end this will significantly speedup the dashboard loading. In a future project I will create a logistics mock application that will feature this enhancement.

**PS:** To use the views in your application code:

```sql
SELECT * FROM mv_employeeleaderboard;
SELECT * FROM mv_customerleaderboard;
SELECT * FROM mv_productleaderboard;
SELECT * FROM mv_recentorders;
SELECT * FROM v_reorderlist;
```
