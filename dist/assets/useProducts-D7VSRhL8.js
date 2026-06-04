import{m as i,a1 as g,J as e}from"./index-CA7uKoGJ.js";import{p as o}from"./productService-Cgr_JXhd.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]],p=i("target",f),x=()=>{const{profile:t}=g(),[n,u]=e.useState([]),[d,s]=e.useState(!0),[y,a]=e.useState(null),r=e.useCallback(async()=>{if(!(t!=null&&t.agencyId)){s(!1);return}s(!0);try{const c=await o.getProducts(t.agencyId);u(c),a(null)}catch(c){a(c.message||"Failed to fetch products")}finally{s(!1)}},[t==null?void 0:t.agencyId]);return e.useEffect(()=>{r()},[r]),{products:n,loading:d,error:y,refresh:r,syncProducts:async c=>{try{await o.syncProducts(c),await r()}catch(l){throw l}}}};export{p as T,x as u};
//# sourceMappingURL=useProducts-D7VSRhL8.js.map
