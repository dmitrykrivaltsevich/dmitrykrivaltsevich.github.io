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
      animation: expand .1s ease-out;
      padding: 10px;
      overflow: auto;
    }

    #seo-panel a {
      color: green;
    }
  `;

  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));

  var head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(style);

  function getTagContent(tagName) {
    return [...document.getElementsByTagName(tagName)].map(tag => tag.innerText).shift();
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
    const doc = parser.parseFromString(docText, "text/html");

    const tags = [...doc.getElementsByClassName(className)];
    const jsons = tags.map(tag => tag.innerText).map(text => JSON.parse(text));
    const entities = jsons.map(json => json['enrichedRootEntity'] || {});
    const ids = entities.map(entity => entity['id']).filter(id => id);
    return ids.shift();
  }

  function toggleView(panelId) {
    var panel = document.getElementById(panelId);
    if (panel) {
      panel.remove();
    } else {
      panel = document.createElement('div');
      panel.id = panelId;
      document.body.prepend(panel);
    }
  }

  function display(message, panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.innerHTML = message;
    }
  }

  function asLink(url) {
    if (url) {
      return `<a href="${url}">${url}</a>`;
    } else {
      return url;
    }
  }

  toggleView('seo-panel');
  display('Loading...', 'seo-panel');

  const entityId = await getEntityId('re-data-el-init');
  const title = getTagContent('title');
  const description = getMetaTagContent('description');
  const h1 = (getTagContent('h1') || '').replaceAll('\n', ' ').replace(/\s+/g, ' ');

  const messages = [
    `Title: ${title || '🤷‍♂️'}`,
    `Title length: ${title ? title.length : 0}`,
    `Description: ${description || '🤷‍♂️'}`,
    `Description length: ${description ? description.length : 0}`,
    `H1: ${h1 || '🤷‍♂️'}`,
    `H1 length: ${h1 ? h1.length : 0}`,
    `Robots: ${getMetaTagContent('robots') || 'INDEX, FOLLOW'}`,
    `Canonical: ${asLink(getLinkHref('canonical')) || '🤷‍♂️'}`,
    `FSA Entity ID: ${entityId || '🤷‍♂️'}`
  ];
  display(messages.join('<br>'), 'seo-panel');
})();
