// ==UserScript==
// @name         Derpi Post Archiver
// @namespace    Eievui
// @version      0.1
// @description  Archive / bookmark derpibooru comments and forum posts to easily view later for funny or helpful posts
// @author       Eievui
// @homepageURL  https://derpibooru.org/profiles/Eievui
// @supportURL   https://derpibooru.org/conversations/new?recipient=Eievui
// @downloadURL  https://github.com/LightEievui/userscripts/raw/main/derpibooru/DerpiPostArchiver.js
// @updateURL    https://github.com/LightEievui/userscripts/raw/main/derpibooru/DerpiPostArchiver.js
// @match        *://*.derpibooru.org/*
// @match        *://*.trixiebooru.org/*
// @icon         https://derpibooru.org/favicon.svg
// @grant        none
// @noframes
// ==/UserScript==

/*
This does not archive badges because each saved badge would've added another ~0.5kb to each post (over 25kb for badumsquish posts)
Archive button will be under each comment and forum post
View your archived from user dropdown list
*/

(function() {
  "use strict";
  let viewSpot = document.querySelectorAll(".dropdown__content.dropdown__content-right.hide-mobile.js-burger-links .header__link");
  let viewArchive = document.createElement("a");
  viewSpot[8].parentNode.insertBefore(viewArchive, viewSpot[8]);
  viewArchive.outerHTML = `<a onclick="window.location.reload();" href="/pages/about#archive?page=1" class="header__link">
    <i class="fa fa-fw fa-box-archive"></i> Archived</a>`;
  if (window.location.href.includes('#') && window.location.href.split('#')[1].substring(0, 7) == "archive") {
    document.getElementById("content").innerHTML = `
        <div class="flex flex--wrap flex--spaced-out">
        <h1>Archived</h1>
        <a onclick="
          if(window.confirm('Are you sure you want to delete all archived posts? \
                    \
                    (This cannot be undone!)')) {
                  localStorage.removeItem('DPA_data');
                  window.location.reload();
                }
          return false;
        " href=""><i class="fa fa-trash"></i> Delete all archived posts </a>
        </div>
          `;

    function NewPost(name, content, avatar, id, url, title, datetime, timetitle, type, num) {
      const html = `
              <article class="block communication" id="post_${id}">
              <div class="block__content flex flex--no-wrap ">
              <div class="flex__fixed spacing-right">
              <div class="image-constrained avatar--100px">
              <img src="${avatar}">
              </div></div>
              <div class="flex__grow communication__body">
              <span class="communication__body__sender-name">
              <strong><a href="/profiles/${name}">${name}</a></strong>
              </span><br>
              ${title}
              <div class="communication__body__text">
              <div class="paragraph">${content}</div>
              </div></div></div>
              <div class="block__content communication__options">
              <div class="flex flex--wrap flex--spaced-out">
              <div>Posted <time datetime="${datetime}" title="${timetitle}">(Loading time...)</time>
          `;
      const unarchive = `
          <a onclick="
        let data = JSON.parse(localStorage.getItem('DPA_data') || '[]');
        data = data.splice(${num + 1}, 1);
        localStorage.setItem('DPA_data', JSON.stringify(data));
        this.parentNode.parentNode.parentNode.parentNode.remove();
        return false;
        " href="" class="communication__interaction">
        <i class="fa fa-box-archive"></i> Unarchive </a>
          `;
      if (type == "image") {
        document.getElementById("content").innerHTML += `
              ${html}
              <a class="communication__interaction" href="${url}#comment_${id}/reports/new">
              <i class="fa fa-flag"></i> Report </a><br></div><div>
              <a class="communication__interaction" href="${url}#comment_${id}" title="Link to post">
              <i class="fa fa-link"></i> Link </a>
              ${unarchive}
              </article>
          `;
      } else {
        document.getElementById("content").innerHTML += `
              ${html}
              <a class="communication__interaction" href="${url}/posts/${id}/reports/new">
              <i class="fa fa-flag"></i> Report </a><br></div><div>
              <a class="communication__interaction" href="${url}?post_id=${id}#post_${id}" title="Link to post">
              <i class="fa fa-link"></i> Link </a>
              ${unarchive}
              </article>
          `;
      }
    }
    const data = JSON.parse(localStorage.getItem("DPA_data") || "[]");
    for (let i = 0; i < data.length; i++) {
      NewPost(data[i].name, data[i].content, data[i].avatar, data[i].id, data[i].url,
        data[i].title, data[i].datetime, data[i].timetitle, data[i].type, i);
    }
  }
  let setSpot = document.querySelectorAll(".post-reply-quote");
  let setArchive = document.createElement("a");
  for (let i = 0; i < setSpot.length; i++) {
    setSpot[i].parentNode.insertBefore(setArchive, setSpot[i]);
    setArchive.outerHTML = `<a onclick="
        const post = event.target.parentNode.parentNode.parentNode.parentNode;
        const name = post.querySelector('.communication__body__sender-name a').innerHTML;
        const content = post.querySelector('.communication__body__text').innerHTML;
        const avatar = post.querySelector('.avatar--100px img').src;
        const id = post.id.split('_')[1];
        const url = window.location.pathname;
        const title = Array.from(post.querySelectorAll('.label--block')).map(x => x.outerHTML).join(' ');
        const datetime = post.querySelector('time').dateTime;
        const timetitle = post.querySelector('time').title;
        let type = 'forum';
        if(window.location.href.includes('images')) {
          type = 'image';
        }
        let data = JSON.parse(localStorage.getItem('DPA_data') || '[]');
        data.push({name:name, content:content, avatar:avatar, id:id, url:url,
          title:title, datetime:datetime, timetitle:timetitle, type:type});
        localStorage.setItem('DPA_data', JSON.stringify(data));
        window.alert('Post added to archive!');
        return false;
        " href="" class="communication__interaction">
        <i class="fa fa-box-archive"></i> Archive </a>`;
  }
})();
