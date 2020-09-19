module.exports = (collection) => {
  let tagSet = new Set();
  collection.getAll().forEach((item) => {
    if ('tags' in item.data) {
      let tags = item.data.tags;

      tags = tags.filter((tag) => {
        switch (tag) {
          // this list should match the `filter` list in tags.njk
          case 'all':
          case 'nav':
          case 'post':
          case 'posts':
            return false;
        }

        return true;
      });

      for (const tag of tags) {
        tagSet.add(tag);
      }
    }
  });

  // returning an array in addCollection works in Eleventy 0.5.3
  return [...tagSet];
};
