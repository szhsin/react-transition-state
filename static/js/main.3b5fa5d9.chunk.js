(this["webpackJsonpreact-transition-state-example"]=this["webpackJsonpreact-transition-state-example"]||[]).push([[0],{11:function(e,t,n){},12:function(e,t,n){"use strict";n.r(t);var c=n(1),r=n(4),i=n.n(r),a=(n(9),n(2)),s=["preEnter","entering","entered","preExit","exiting","exited","unmounted"],u=function(e){return e?6:5},o=function(e,t,n,c){clearTimeout(c.current),t(e),n.current=e},b=n(0);var l=function(){var e=Object(c.useState)(!1),t=Object(a.a)(e,2),n=t[0],r=t[1],i=function(){var e,t,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=n.initialEntered,i=n.mountOnEnter,b=n.unmountOnExit,l=n.timeout,j=n.preState,d=n.enter,f=void 0===d||d,m=n.exit,O=void 0===m||m,h=Object(c.useState)(r?2:u(i)),x=Object(a.a)(h,2),p=x[0],v=x[1],g=Object(c.useRef)(p),k=Object(c.useRef)();"object"===typeof l?(e=l.enter,t=l.exit):e=t=l;var E=Object(c.useCallback)((function(){var e;switch(g.current){case 0:case 1:e=2;break;case 3:case 4:e=u(b)}e&&o(e,v,g,k)}),[b]),C=Object(c.useCallback)((function(n){switch(o(n,v,g,k),n){case 0:case 3:k.current=setTimeout((function(){return C(n+1)}),0);break;case 1:e>=0&&(k.current=setTimeout(E,e));break;case 4:t>=0&&(k.current=setTimeout(E,t))}}),[e,t,E]),T=Object(c.useCallback)((function(e){var t=g.current<=2;"boolean"!==typeof e&&(e=!t),e?t||C(f?j?0:1:2):t&&C(O?j?3:4:u(b))}),[f,O,j,b,C]);return Object(c.useEffect)((function(){return function(){return clearTimeout(k.current)}}),[]),[s[p],T,E]}({timeout:750,initialEntered:!0,preState:!0,unmountOnExit:n}),l=Object(a.a)(i,2),j=l[0],d=l[1];return Object(b.jsxs)("div",{className:"basic-example",children:[Object(b.jsxs)("div",{className:"basic-console",children:[Object(b.jsxs)("div",{className:"basic-state",children:["state: ",j]}),Object(b.jsxs)("label",{children:["Unmount after hiding",Object(b.jsx)("input",{type:"checkbox",checked:n,onChange:function(e){return r(e.target.checked)}})]}),Object(b.jsx)("button",{className:"btn",onClick:function(){return d()},children:"entering"===j||"entered"===j?"Hide":"Show"})]}),"unmounted"!==j&&Object(b.jsx)("div",{className:"basic-transition ".concat(j),children:"React transition state"})]})};n(11);var j=function(){return Object(b.jsx)("div",{className:"App",children:Object(b.jsx)(l,{})})},d=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,13)).then((function(t){var n=t.getCLS,c=t.getFID,r=t.getFCP,i=t.getLCP,a=t.getTTFB;n(e),c(e),r(e),i(e),a(e)}))};i.a.render(Object(b.jsx)(j,{}),document.getElementById("root")),d()},9:function(e,t,n){}},[[12,1,2]]]);
//# sourceMappingURL=main.3b5fa5d9.chunk.js.map