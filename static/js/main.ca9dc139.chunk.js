(this["webpackJsonpreact-transition-state-example"]=this["webpackJsonpreact-transition-state-example"]||[]).push([[0],{11:function(e,t,n){},12:function(e,t,n){"use strict";n.r(t);var c=n(1),i=n(4),r=n.n(i),a=(n(9),n(2)),s=["preEnter","entering","entered","preExit","exiting","exited","unmounted"],u=function(e){return e?6:5},o=function(e,t,n,c){clearTimeout(c.current),t(e),n.current=e},b=n(0);var l=function(){var e=Object(c.useState)(!1),t=Object(a.a)(e,2),n=t[0],i=t[1],r=function(){var e,t,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=n.initialEntered,r=n.mountOnEnter,b=n.unmountOnExit,l=n.timeout,j=n.preEnter,d=n.preExit,f=n.enter,h=void 0===f||f,m=n.exit,O=void 0===m||m,x=Object(c.useState)(i?2:u(r)),p=Object(a.a)(x,2),g=p[0],v=p[1],k=Object(c.useRef)(g),E=Object(c.useRef)();"object"===typeof l?(e=l.enter,t=l.exit):e=t=l;var C=Object(c.useCallback)((function(){var e;switch(k.current){case 0:case 1:e=2;break;case 3:case 4:e=u(b)}e&&o(e,v,k,E)}),[b]),N=Object(c.useCallback)((function(n){switch(o(n,v,k,E),n){case 0:case 3:E.current=setTimeout((function(){return N(n+1)}),0);break;case 1:e>=0&&(E.current=setTimeout(C,e));break;case 4:t>=0&&(E.current=setTimeout(C,t))}}),[e,t,C]),T=Object(c.useCallback)((function(e){var t=k.current<=2;"boolean"!==typeof e&&(e=!t),e?t||N(h?j?0:1:2):t&&N(O?d?3:4:u(b))}),[h,O,j,d,b,N]);return Object(c.useEffect)((function(){return function(){return clearTimeout(E.current)}}),[]),[s[g],T,C]}({timeout:750,initialEntered:!0,preEnter:!0,unmountOnExit:n}),l=Object(a.a)(r,2),j=l[0],d=l[1];return Object(b.jsxs)("div",{className:"basic-example",children:[Object(b.jsxs)("div",{className:"basic-console",children:[Object(b.jsxs)("div",{className:"basic-state",children:["state: ",j]}),Object(b.jsxs)("label",{children:["Unmount after hiding",Object(b.jsx)("input",{type:"checkbox",checked:n,onChange:function(e){return i(e.target.checked)}})]}),Object(b.jsx)("button",{className:"btn",onClick:function(){return d()},children:"entering"===j||"entered"===j?"Hide":"Show"})]}),"unmounted"!==j&&Object(b.jsx)("div",{className:"basic-transition ".concat(j),children:"React transition state"})]})};n(11);var j=function(){return Object(b.jsxs)("div",{className:"App",children:[Object(b.jsx)("a",{href:"https://github.com/szhsin/react-transition-state",title:"GitHub",className:"github",children:Object(b.jsx)("img",{src:"GitHub-64.png",alt:"GitHub"})}),Object(b.jsx)(l,{})]})},d=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,13)).then((function(t){var n=t.getCLS,c=t.getFID,i=t.getFCP,r=t.getLCP,a=t.getTTFB;n(e),c(e),i(e),r(e),a(e)}))};r.a.render(Object(b.jsx)(j,{}),document.getElementById("root")),d()},9:function(e,t,n){}},[[12,1,2]]]);
//# sourceMappingURL=main.ca9dc139.chunk.js.map