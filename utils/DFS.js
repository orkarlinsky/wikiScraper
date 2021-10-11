// doDFS([{ link: "/wiki/Peak_oil", depthLeft: 1, alg: "DFS" }]);
function doDFS(data) {
  data = data[0];
  const link = data.link;
  var depthLeft = data.depthLeft;
  var orderID = 0;
  var items = [];

  function recurse(link, depth){
    depth = depth?depth:0;
    var url = link.url;
    if(depth < depthLeft){
      try{
        const { wikiItem, internalLinks } = await WikiItemReader.read(
          url,
          orderID,
          depth
        );
        depth
        internalLinks.forEach(function(link,i){
          if(items.indexOf(link.url)<0){
            items.push(link.url);
            recurse(link.url,depth+1);
          }
        });

        return items;
      }catch(err){

      }
    }
  }
        
  items = recurse(link);
  //console.log(items);
}
