tassembly
=========

JSON IR for templating and corresponding runtime implementation

**"Fast but safe"**

Security guarantees of DOM-based templating (tag balancing, context-sensitive
href/src/style sanitization etc) with the performance of string-based templating.

See
 [this page for background.](https://www.mediawiki.org/wiki/Requests_for_comment/HTML_templating_library/Knockout_-_Tassembly)

* The JSON format is compact, can easily be persisted and can be evaluated with
a tiny library.

* Performance is on par with compiled handlebars templates, the fastest
string-based library in our tests.

* Compilation target for [KnockoutJS templates
  (KoTasm)](https://github.com/gwicke/kotasm) and
  [Spacebars](https://github.com/gwicke/TemplatePerf/tree/master/handlebars-htmljs-node/spacebars-qt).

Examples:

```javascript
['<div',['attr',{id:'id'}],'>',['text','body'],'</div>']

['<div',['attr',{id:'id'}],'>',
      ['foreach',{data:'items',tpl:['<div',['attr',{id:'key'}],'>',['text','val'],'</div>']}],
'</div>']
```
