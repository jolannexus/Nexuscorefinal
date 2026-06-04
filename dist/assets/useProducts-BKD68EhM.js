import{m as l,a1 as g,J as r}from"./index-DB0FLwEd.js";import{p as o}from"./productService-C-mzUEDu.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]],p=l("target",f),x=()=>{const{profile:t}=g(),[n,u]=r.useState([]),[y,s]=r.useState(!0),[d,a]=r.useState(null),e=r.useCallback(async()=>{if(!(t!=null&&t.agencyId)){s(!1);return}s(!0);try{const c=await o.getProducts(t.agencyId);u(Array.isArray(c)?c:[]),a(null)}catch(c){a(c.message||"Failed to fetch products")}finally{s(!1)}},[t==null?void 0:t.agencyId]);return r.useEffect(()=>{e()},[e]),{products:n,loading:y,error:d,refresh:e,syncProducts:async c=>{try{await o.syncProducts(c),await e()}catch(i){throw i}}}};export{p as T,x as u};
//# sourceMappingURL=useProducts-BKD68EhM.js.map
