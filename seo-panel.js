(async () => {
  var css = `
    @keyframes expand {
      from {
        transform: scale(0);
        opacity: 0;
      }
    }

    #seo-panel {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100000;
      width: 100%;
      height: 250px;
      background: black;
      color: white;
      opacity: 75%;
      font: 12px/16px Menlo,Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace,serif;
      animation: expand .5s ease-out;
      padding: 10px;
    }
  `;

  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));

  var head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(style);

  function getTagContent(tagName) {
    return document.getElementsByTagName(tagName)[0].innerText;
  }

  function getMetaTagContent(metaName) {
    const metas = [...document.getElementsByTagName('meta')].filter(tag => tag.getAttribute('name') === metaName);
    const contents = metas.map(meta => meta.getAttribute('content'));
    return contents.shift();
  }

  function getLinkHref(rel) {
    const links = [...document.getElementsByTagName('link')].filter(link => link.getAttribute('rel') === rel);
    const urls = links.map(link => link.getAttribute('href'));
    return urls.shift();
  }

  async function getEntityId(className) {
    const docText = await fetch(window.location).then(res => res.text());
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const tags = [...parser.getElementsByClassName(className)];
    const jsons = tags.map(tag => tag.innerText).map(text => JSON.parse(text));
    const entities = jsons.map(json => json['enrichedRootEntity'] || {});
    const ids = entities.map(entity => entity['id']).filter(id => id);
    return ids.shift();
  }

  var messages = [
    `Title: ${getTagContent('title')}`,
    `Description: ${getMetaTagContent('description') || '🤷‍♂️'}`,
    `H1: ${getTagContent('h1').replaceAll('\n', ' ').replace(/\s+/g, ' ')}`,
    `Robots: ${getMetaTagContent('robots') || 'INDEX, FOLLOW'}`,
    `Canonical: ${getLinkHref('canonical') || '🤷‍♂️'}`,
    `FSA Entity ID: ${await getEntityId('re-data-el-init')}`
  ];

  var panel = document.createElement('div');
  panel.innerHTML = messages.join('<br>');
  panel.id = 'seo-panel';
  document.body.prepend(panel);
})();
