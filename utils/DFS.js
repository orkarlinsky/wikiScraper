// doDFS([{ link: "/wiki/Peak_oil", depthLeft: 1, alg: "DFS" }]);
/*function doDFS(data) {
  data = data[0];
  const link = data.link;
  var depthLeft = data.depthLeft;
  var orderID = 0;
  var items = [];
  function done(){
	  
  }
  async function recurse(links) {
    async function read(link, i) {
      const { wikiItem, internalLinks } = await WikiItemReader.read(
        link.link,
        orderID,
        depthLeft
      );
      orderID++;
      //console.log(internalLinks);
      if (depthLeft == 0) {
        return wikiItem;
      } else {
        depthLeft--;
        return recurse(internalLinks);
      }
      console.log(depthLeft);
    }
    links.forEach(function (link, i) {
      items.push(read(link, i));
    });
  }
  recurse([{ link: link }]);
  console.log(items);
}*/