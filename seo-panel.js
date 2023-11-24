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

    #seo-panel .index {
      color: green;
    }

    #seo-panel .noindex {
      color: red;
    }

    #seo-panel summary:after {
      content: "+"; 
      float: left; 
      text-align: center;
      padding-right: 5px;
    }
    
    #seo-panel details[open] summary:after {
      content: "-";
    }
  `;

  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));

  const head = document.head || document.getElementsByTagName('head')[0];
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
    return url ? `<a href="${url}">${url}</a>` : url;
  }

  function colorize(text) {
    return text.toLowerCase().includes('noindex') ? `<span class="noindex">${text}</span>` : `<span class="index">${text}</span>`
  }

  async function getTemplates(url, entityId) {
    const endpoint = 'https://stt-tars-production.fashion-store.zalan.do/seo-text';
    const params = { uri: url, templates_only: true };
    const requestUrl = new URL(endpoint);
    requestUrl.search = new URLSearchParams(params).toString();

    const response = await fetch(requestUrl, {
      headers: {
        'accept-language': 'de-DE',
        'x-sales-channel': '01924c48-49bb-40c2-9c32-ab582e6db6f4',
        'x-zalando-entity-id': entityId
      }
    });

    const data = await response.json();
    console.log(data);
    return {
      title: data.title,
      description: data.meta_description,
      h1: 'not implemented yet'
    }
  }

  toggleView('seo-panel');
  display('Loading...', 'seo-panel');

  const entityId = await getEntityId('re-data-el-init');
  const title = getTagContent('title');
  const description = getMetaTagContent('description');
  
  // Modified code to get all h1 tags
  const h1Tags = [...document.getElementsByTagName('h1')];
  const h1Contents = h1Tags.map(tag => `<span>👉 ${tag.innerText}</span>`);
  console.log(h1Tags);
  const links = [...document.links].map(a => `${a.textContent}: ${asLink(a.href)}`).sort();
  // const templates = getTemplates(window.location.href, entityId);

  const messages = [
    `Title (${title ? title.length : 0}): ${title || '🤷‍♂️'}`,
    // `Title template: ${templates.title || '🤷‍♂️'}`,
    `Description (${description ? description.length : 0}): ${description || '🤷‍♂️'}`,
    // `Description template: ${templates.description || '🤷‍♂️'}`,
    `H1 (${h1Contents ? h1Contents.length : 0}): ${h1Contents || '🤷‍♂️'}`,
    `H1 Duplicate : ${h1Tags.length > 1 ? 'Yes' : 'No'}`,
    // `H1 template: ${templates.h1 || '🤷‍♂️'}`,
    `Robots: ${colorize(getMetaTagContent('robots') || 'INDEX, FOLLOW')}`,
    `Canonical: ${asLink(getLinkHref('canonical')) || '🤷‍♂️'}`,
    `<details><summary>Links (${links.length})</summary><p>${links.join('<br/>')}</p></details>`,
    `FSA Entity ID: ${entityId || '🤷‍♂️'}`
  ];
  display(messages.join('<br/>'), 'seo-panel');
})();
