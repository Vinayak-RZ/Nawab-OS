var Qe=(e,$=document)=>$.querySelector(e),Xe=(e,$=document)=>[...$.querySelectorAll(e)];function pe(e){e.$=Qe,e.$$=Xe}function Ze(e){let $=document.createElement("div");return $.textContent=e??"",$.innerHTML}function xe(e){return"$"+Number(e||0).toLocaleString(void 0,{maximumFractionDigits:0})}function et(e){return e?new Date(typeof e=="number"&&e<1e12?e*1e3:e).toLocaleString():""}function tt(e){return new Promise($=>setTimeout($,e))}function me(e){e.esc=Ze,e.fmtMoney=xe,e.fmtTime=et,e.sleep=tt}function at(e,$){try{let S=localStorage.getItem(e);return S?JSON.parse(S):$}catch(S){return console.warn(`[storage] corrupt ${e}, resetting`,S),localStorage.removeItem(e),$}}function he(e){e.readJsonStorage=at}var st="Nawab OS",nt=[{id:"pulse",label:"Pulse",role:"aggregator",tool_count:0,brief:"Operating pulse across parallel projects"},{id:"outreach",label:"Outreach",role:"outreach",tool_count:0,brief:"Outreach drafts and CRM pipeline"},{id:"leads",label:"Leads",role:"leads",tool_count:0,brief:"Lead lists and contact priorities"},{id:"market",label:"Market intel",role:"research",tool_count:0,brief:"Industry and competitor intelligence"},{id:"vault",label:"Vault",role:"knowledge",tool_count:0,brief:"Knowledge vault librarian"}],ot=[{id:"auto",label:"Auto",hint:"Agent picks retrieval"},{id:"hybrid",label:"Hybrid RAG",hint:"Dense + BM25 fusion"},{id:"graphrag",label:"GraphRAG",hint:"Knowledge graph communities"},{id:"vault",label:"Vault",hint:"World knowledge vault"},{id:"documents",label:"Documents",hint:"Ingested document store"}],rt={dashboard:"Control center",chat:"Ask agent",agents:"Agent fleet",world:"Worlds",approvals:"Approvals",crm:"CRM & pipeline",outreach:"Outreach",goals:"Goals & tasks",memory:"Memory",documents:"Documents",history:"History",tools:"Tools",activity:"Activity",settings:"Settings"},it=["prospect","contacted","replied","meeting","won","lost","nurture"],lt=["prospect","contacted","responded","meeting_set","closed","dead"],dt=["#f75440","#00666b","#03904a","#051f13","#5a403c","#8f706b","#e3beb8"],ct=15,ut=30,pt=5e3,mt=3e4,ht=3e4,gt={aggregator:{label:"Aggregator",cls:"agent-role--aggregator",avatar:"agent-avatar--aggregator"},outreach:{label:"Outreach",cls:"agent-role--outreach",avatar:"agent-avatar--outreach"},leads:{label:"Leads",cls:"agent-role--leads",avatar:"agent-avatar--leads"},research:{label:"Intel",cls:"agent-role--research",avatar:"agent-avatar--research"},knowledge:{label:"Vault",cls:"agent-role--vault",avatar:"agent-avatar--knowledge"}},ft={supervisor:"SV",pulse:"PL",outreach:"OR",leads:"LD",market:"MK",vault:"VL"},bt={root:{label:"Main",cls:"world-kind--root"},project:{label:"Startup",cls:"world-kind--project"},startup:{label:"Startup",cls:"world-kind--project"},technical:{label:"Technical",cls:"world-kind--research"},idea:{label:"Idea",cls:"world-kind--idea"},research:{label:"Research",cls:"world-kind--research"}};function ge(e){Object.assign(e,{APP_NAME:st,DEFAULT_SPECIALISTS:nt,RAG_MODES:ot,TITLES:rt,CRM_STATUSES:it,COMPANY_STATUSES:lt,CHART_COLORS:dt,MSG_READ_INITIAL_LINES:ct,MSG_READ_EXPAND_LINES:ut,LIVE_POLL_MS:pt,LIVE_POLL_HIDDEN_MS:mt,REFRESH_MS:ht,AGENT_ROLES:gt,AGENT_INITIALS:ft,WORLD_KINDS:bt})}function fe(e){async function $(b,s,g="POST"){let p=await fetch("/api"+b,{method:g,body:s,credentials:"same-origin"}),h=await p.json().catch(()=>({}));if(p.status===401&&h.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!p.ok)throw new Error(h.error||p.statusText);return h}async function S(b,s={}){let g=new AbortController,p=s.timeoutMs??3e4,h=setTimeout(()=>g.abort(),p),{timeoutMs:r,headers:a,signal:n,...u}=s;try{let i=await fetch("/api"+b,{...u,credentials:"same-origin",headers:{"Content-Type":"application/json",...a||{}},signal:n||g.signal}),f=await i.json().catch(()=>({}));if(i.status===401&&f.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!i.ok)throw new Error(f.error||i.statusText);return f}catch(i){throw i.name==="AbortError"?new Error("Request timed out \u2014 is the server running?"):i}finally{clearTimeout(h)}}e.api=S,e.apiUpload=$}function be(e){function $(){let S=localStorage.getItem("fos_selected_specialist");if(S!==null)return S;let b=localStorage.getItem("fos_selected_agent");return b&&b!=="supervisor"?b:""}e.state={live:{},selectedSpecialist:$(),ragMode:localStorage.getItem("fos_rag_mode")||"auto",activeWorldId:localStorage.getItem("fos_active_world")||"root",agentsTab:localStorage.getItem("fos_agents_tab")||"runs",expandedRunId:null,ui:{worldCreateOpen:!1,crmFormOpen:!1,goalsFormOpen:!1,reminderFormOpen:!1,vaultFacet:null,vaultDocForm:null,vaultDocEdit:null},_worldTemplates:null,_operations:{},_chatAttachments:[]},e.state._syncingLinkIds=new Set,e.currentView="dashboard",e.chatHistory=e.readJsonStorage("fos_chat",[]),e.historyTab=localStorage.getItem("fos_history_tab")||"conversations",e.documentsEditMode=!1,e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.livePollTimer=null,e._runtimePollTick=0,e.whatsappPollTimer=null,e.memoryGraphTab="graph",e.worldGraphTab="hierarchy",e.lastLiveActive=!1,e.viewDataLoadGen=0,e.vaultLoadGen=0,e.graphDrawCache={},e.actionBusyDepth=0,e.actionBusyButton=null,e._actionOwnedLoading=!1,e.refreshTimer=null,e.loadSelectedSpecialist=$}function ve(e){function $(){let u=e.state.config||{};return u.my_name?`${u.my_name}'s ${e.APP_NAME}`:e.APP_NAME}function S(){return e.state.activeWorldId||e.$("#world-select")?.value||"root"}function b(){let u=e.state.worlds||e.state._worldFull?.worlds||{},i=e.currentWorldId();return i==="root"?u.root?.name||"Main world":(u.children||[]).find(O=>O.id===i)?.name||i}function s(u){e.state.activeWorldId=u||"root",localStorage.setItem("fos_active_world",e.state.activeWorldId),e.populateWorldSelect(),e.updateWorldContextChrome()}function g(){let u=e.$("#world-select");if(!u)return;let i=e.state.activeWorldId||"root";[...u.options].some(f=>f.value===i)&&(u.value=i)}function p(){let u=e.activeWorldLabel();document.querySelectorAll("[data-active-world-label]").forEach(i=>{i.textContent=u}),e.syncWorldSelectValue(),e.currentView==="world"&&e.patchWorldTreeNav()}function h(){let u=e.$("#specialist-select-agents")?.value??e.state.selectedSpecialist??"";return u==="auto"?"":u||""}function r(){return e.$("#rag-mode-select")?.value||e.state.ragMode||"auto"}function a(){return!!e.currentSpecialistId()}function n(){let u=e.$("#world-select");if(!u)return;let i=e.state.worlds||e.state._worldFull?.worlds||{},f=i.root,O=i.children||[],I=O.map(w=>`<option value="${e.esc(w.id)}">${e.esc(w.name)} \xB7 ${e.esc(w.kind||"project")}</option>`).join("");u.innerHTML=`
      <optgroup label="Main">
        <option value="root">${e.esc(f?.name||"Main world")} \u2014 all context</option>
      </optgroup>
      ${O.length?`<optgroup label="Sub-worlds">${I}</optgroup>`:""}`;let y=e.state.activeWorldId||"root";[...u.options].some(w=>w.value===y)?u.value=y:(u.value="root",e.state.activeWorldId="root",localStorage.setItem("fos_active_world","root"))}e.ownerLabel=$,e.currentWorldId=S,e.activeWorldLabel=b,e.setActiveWorld=s,e.syncWorldSelectValue=g,e.updateWorldContextChrome=p,e.currentSpecialistId=h,e.currentRagMode=r,e.isDirectSpecialist=a,e.populateWorldSelect=n}function ye(e){function $(a,n={}){e.state._viewLoading=!!a;let u=document.getElementById("global-progress"),i=u?.querySelector(".global-progress__bar");u&&(u.hidden=!a,u.setAttribute("aria-hidden",a?"false":"true"),a&&n.progress==null?(u.classList.add("is-indeterminate"),i&&(i.style.width="")):a&&n.progress!=null?(u.classList.remove("is-indeterminate"),i&&(i.style.width=`${Math.min(100,n.progress)}%`)):(u.classList.remove("is-indeterminate"),i&&(i.style.width="0")))}function S(a){e.actionBusyDepth++,e.actionBusyDepth===1&&(e._actionOwnedLoading=!e.state._viewLoading,e._actionOwnedLoading&&e.setViewLoading(!0),document.body.classList.add("is-action-busy"));let n=a?.closest?.("button, [role='button']")||a;n&&!e.actionBusyButton&&(e.actionBusyButton=n,n.classList.add("is-loading"),n.setAttribute("aria-busy","true"),"disabled"in n&&(n.disabled=!0))}function b(a){let n=e.actionBusyButton;n&&(n.classList.remove("is-loading"),n.removeAttribute("aria-busy"),"disabled"in n&&!n.dataset.keepDisabled&&(n.disabled=!1),e.actionBusyButton=null),e.actionBusyDepth=Math.max(0,e.actionBusyDepth-1),e.actionBusyDepth===0&&(e._actionOwnedLoading&&(e.setViewLoading(!1),e._actionOwnedLoading=!1),document.body.classList.remove("is-action-busy"))}function s(a,n){e.beginActionBusy(n);try{let u=a();return u!=null&&typeof u.then=="function"?u.finally(()=>e.endActionBusy(n)):(e.endActionBusy(n),u)}catch(u){throw e.endActionBusy(n),u}}function g(a){return!!(!a||a.id==="chat-send"||a.id==="chat-clear"||a.dataset.toggleUi!==void 0||a.dataset.goto!==void 0||a.dataset.toggleRun!==void 0||a.dataset.memoryTab!==void 0||a.dataset.vaultFacet!==void 0||a.dataset.vaultAddDoc!==void 0||a.dataset.vaultCancelDoc!==void 0||a.dataset.removeAttachment!==void 0||a.dataset.historyTab!==void 0||a.dataset.pickVaultDoc!==void 0||a.dataset.cancelEdit!==void 0||a.dataset.editWorld!==void 0||a.dataset.docsAction==="toggle"||a.hasAttribute("data-outreach-save-companies")||a.matches?.("[data-crm-company-toggle]"))}function p(a="72%"){return`<span class="skeleton" style="display:block;height:12px;width:${a}"></span>`}function h(a=3){return`<div class="skeleton-card driver-card">${Array.from({length:a},(u,i)=>e.skeletonLine(i===0?"38%":"88%")).join("")}</div>`}function r(a){let n=`<div class="skeleton-grid">${e.skeletonCard(2)}${e.skeletonCard(2)}${e.skeletonCard(2)}</div>`;return a==="dashboard"?`<div class="view-skeleton dashboard-grid">${e.skeletonCard(2)}<div class="span-8">${e.skeletonCard(4)}</div><div class="span-4">${e.skeletonCard(2)}</div>${n}</div>`:a==="chat"?`<div class="view-skeleton"><div class="skeleton-card driver-card">${e.skeletonLine("30%")}${e.skeletonLine("60%")}</div><div class="skeleton-card driver-card" style="min-height:280px">${e.skeletonLine("100%")}${e.skeletonLine("92%")}${e.skeletonLine("78%")}</div></div>`:a==="world"?`<div class="view-skeleton dashboard-grid"><div class="span-4">${e.skeletonCard(3)}</div><div class="span-8">${e.skeletonCard(5)}</div>${n}</div>`:a==="documents"?`<div class="view-skeleton docs-workspace"><div class="skeleton-card driver-card">${e.skeletonCard(4)}</div><div class="skeleton-card driver-card">${e.skeletonCard(6)}</div></div>`:a==="outreach"?`<div class="view-skeleton">${e.skeletonCard(2)}${e.skeletonCard(4)}</div>`:`<div class="view-skeleton">${e.skeletonCard(3)}${n}</div>`}e.setViewLoading=$,e.beginActionBusy=S,e.endActionBusy=b,e.runWithActionBusy=s,e.shouldSkipActionBusy=g,e.skeletonLine=p,e.skeletonCard=h,e.renderViewSkeleton=r}function we(e){function $(){e.state._worldVault=null,e.state._vaultGraph=null,e.state._vaultWorldId=null,e.state._vaultLoading=!1}function S(){return e.state._worldVault?.vault||e.state._worldVault||null}function b(n){return!!(n&&n!=="root"&&e.state._vaultWorldId===n&&e.vaultPayload())}function s(n,u=""){if(!n)return`${u}:empty`;let i=n.nodes||[],f=n.edges||[],O=n.meta||{},I=i.slice(0,12).map(y=>`${y.data?.id}:${y.data?.label}`).join("|");return`${u}:${i.length}:${f.length}:${O.updated||""}:${O.document_count||""}:${I}`}function g(...n){if(!n.length){Object.keys(e.graphDrawCache).forEach(u=>delete e.graphDrawCache[u]);return}n.forEach(u=>delete e.graphDrawCache[u])}function p(n,u,i={},f="Nothing to visualize yet."){if(!window.FOSGraph)return null;let O=document.getElementById(n);if(!O)return null;let I=O.parentElement?.querySelector(`[data-graph-placeholder-for="${n}"]`);I||(I=document.createElement("p"),I.className="graph-placeholder body-md muted",I.dataset.graphPlaceholderFor=n,O.insertAdjacentElement("afterend",I));let y=u?.nodes||[],w=u?.edges||[],A=y.length===1&&y[0]?.data?.type==="empty",L=y.length===1&&y[0]?.data?.type==="loading",M=y.length+w.length>0&&!A&&!L,j=e.graphDataSignature(u,`${n}:${i.layout?.name||"default"}:${i.onSelect?"interactive":"static"}`),U=null;return M?e.graphDrawCache[n]===j&&FOSGraph.getCy(n)&&!i.onSelect?U=FOSGraph.getCy(n):(U=FOSGraph.render(n,u,i),e.graphDrawCache[n]=j):(FOSGraph.destroy(n),delete e.graphDrawCache[n]),U?(O.classList.remove("is-empty"),I.hidden=!0):(O.classList.add("is-empty"),I.hidden=!1,I.textContent=L?y[0]?.data?.label||"Loading\u2026":f),U}function h(n){e.worldGraphTab=n,document.querySelectorAll("[data-world-graph-tab]").forEach(i=>{i.classList.toggle("is-active",i.dataset.worldGraphTab===n)});let u=document.getElementById("world-graph-legend");u&&(u.innerHTML=e.worldGraphLegendHtml(n)),e.drawGraphs()}async function r(){if(window.FOSGraph){try{window.FOSVendors&&await window.FOSVendors.ensure(["cytoscape"])}catch(n){console.warn("cytoscape load failed:",n);return}if(e.currentView==="dashboard"&&e.state._runtimeGraph&&e.renderGraphOrPlaceholder("graph-runtime-dash",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:20}},"Runtime graph appears when an agent is active."),e.currentView==="agents"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-agents")&&e.renderGraphOrPlaceholder("graph-runtime-agents",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="chat"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-chat")&&e.renderGraphOrPlaceholder("graph-runtime-chat",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="world"){let n=e.worldById(e.inspectorWorldId());if(e.worldGraphTab==="vault"&&!e.isRootWorld(n))e.renderGraphOrPlaceholder("graph-world",e.vaultGraphForWorld(n),{layout:FOSGraph.HIERARCHY_LAYOUT,onSelect:u=>{u.facet_id&&(e.state.ui={...e.state.ui||{},vaultFacet:u.facet_id},e.patchWorldPanels())}},"No files yet \u2014 add documents or link a GitHub repo in the knowledge panel below.");else{let u=e.worldGraphTab==="ecosystem"?e.state._worldGraph:e.state._worldHierarchyGraph||e.state._worldGraph;u?(e.renderGraphOrPlaceholder("graph-world",u,{layout:e.worldGraphTab==="hierarchy"?FOSGraph.HIERARCHY_LAYOUT:FOSGraph.LAYOUT,onSelect:i=>{i.world_id&&e.selectInspectorWorld(i.world_id)}},"World map will appear once your hierarchy is loaded."),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())):e.renderGraphOrPlaceholder("graph-world",null,{},"World map will appear once your hierarchy is loaded.")}}e.currentView==="memory"&&e.state._memoryGraph&&e.renderGraphOrPlaceholder("graph-memory",e.state._memoryGraph,{onSelect:n=>{let u=e.$("#graph-memory-detail");u&&(u.textContent=`${n.type}: ${n.label}`)}},"Memory graph fills in as you store knowledge and run agents.")}}async function a(){let n=e.currentView;if(["dashboard","agents","chat","world"].includes(n)&&!e.state._runtimeGraph)try{e.state._runtimeGraph=await e.api("/graph/runtime")}catch{e.state._runtimeGraph=null}if(n==="world"){if(!e.state._worldFull?.graph)try{let i=await e.api("/graph/world");e.state._worldGraph=i?.graph??null,e.state._worldHierarchyGraph=i?.hierarchy_graph??null,e.state._worldPreviews=i?.world_previews??{},e.state._worldFull=i,e.invalidateGraphCache("graph-world")}catch{}}else n==="dashboard"&&e.state._world&&(e.state._worldGraph=e.state._world.graph??e.state._worldGraph??null,e.state._world.worlds&&!e.state.worlds?.root&&(e.state.worlds=e.state._world.worlds));if(n==="memory"&&!e.state._memoryFull?.graph)try{let i=await e.api("/graph/memory");e.state._memoryGraph=i.graph??null,e.state._memoryFull=i,e.invalidateGraphCache("graph-memory")}catch{}}e.clearVaultScopedState=$,e.vaultPayload=S,e.vaultReadyFor=b,e.graphDataSignature=s,e.invalidateGraphCache=g,e.renderGraphOrPlaceholder=p,e.switchWorldGraphTab=h,e.drawGraphs=r,e.loadGraphData=a}function _e(e){function $(r,a="Waiting for activity\u2026"){return r?.length?`<div class="tool-flow">${r.map((n,u)=>{let i=u>0?'<span class="tool-flow-arrow" aria-hidden="true">\u2192</span>':"";if(n.type==="phase")return`${i}<span class="tool-flow-node">${e.esc(n.label)}</span>`;let f=n.decision==="approve"?" is-approve":n.decision==="deny"?" is-deny":"";return`${i}<span class="tool-flow-node${f}">${e.esc(n.name||n.label)}</span>`}).join("")}</div>`:`<p class="body-md muted">${e.esc(a)}</p>`}function S(r,a="live-panel"){let n=r?.jobs?.length?r.jobs:r?.active?[r]:[],u=n.some(y=>y.active||y.status==="running")||r?.active,i=n[0]||r||{},f=i.events||r?.events||[],O=f.map((y,w)=>`<option value="${w}"${w===f.length-1?" selected":""}>${e.esc(y.label||y.name||"Step")}</option>`).join(""),I=n.length?n.map(y=>`
      <div class="live-job${y.active||y.status==="running"?" is-active":""}">
        <div class="live-job__head">
          <span class="mono">${e.esc(y.specialist||y.mode||"agent")}</span>
          <span class="muted">${y.elapsed_s||0}s</span>
        </div>
        <p class="live-job__phase">${e.esc(y.phase||"Working\u2026")}</p>
        ${y.active||y.status==="running"?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(y.id)}">Stop</button>`:`<span class="badge-pill">${e.esc(y.status||"done")}</span>`}
      </div>`).join(""):"";return`<section class="live-panel${u?" is-active":""}" id="${a}" aria-live="polite">
      <div class="live-panel__head">
        <p class="caption-uppercase">Live operation</p>
        ${u&&i.id?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(i.id)}">Stop</button>`:""}
      </div>
      <p class="live-phase" id="${a}-phase">${e.esc(i.phase||r?.phase||"Idle \u2014 send a message or delegate a task")}</p>
      ${f.length?`<label class="live-phase-select"><span class="caption-uppercase">Step</span>
        <select class="world-select" id="${a}-step" aria-label="Current step">${O}</select></label>`:""}
      <div id="${a}-flow">${e.renderLiveFlow(f)}</div>
      ${I?`<div class="live-jobs">${I}</div>`:""}
      ${u&&r?.elapsed_s?`<p class="world-meta">${r.elapsed_s}s elapsed \xB7 ${e.esc(r.actor||i.specialist||"")}</p>`:""}
    </section>`}function b(r){let a=e.$("#live-strip"),n=e.$("#live-strip-text");if(!a)return;let u=!!r?.active;u!==e.lastLiveActive&&(FOSMotion?.pulseLiveStrip?.(u),e.lastLiveActive=u),n&&u&&(n.textContent=r.phase||"Agent working\u2026")}function s(r){e.state.live=r||{},e.updateLiveStrip(r),e.$$("[id$='-phase']").forEach(a=>{a.textContent=r?.phase||"Idle"}),e.$$("[id$='-flow']").forEach(a=>{a.innerHTML=e.renderLiveFlow(r?.events||[])}),e.$$(".live-panel").forEach(a=>a.classList.toggle("is-active",!!r?.active))}async function g(){try{let r=await e.api("/live",{timeoutMs:15e3});if(e.state.live=r,e.patchLiveUI(r),["dashboard","agents","chat"].includes(e.currentView)&&(r?.active||e._runtimePollTick++%4===0)){let n=e.graphDataSignature(e.state._runtimeGraph,"runtime");e.state._runtimeGraph=await e.api("/graph/runtime").catch(()=>e.state._runtimeGraph);let u=e.graphDataSignature(e.state._runtimeGraph,"runtime");n!==u&&(e.invalidateGraphCache("graph-runtime-dash","graph-runtime-agents","graph-runtime-chat"),e.drawGraphs())}}catch{}}function p(){e.stopLivePoll(),e._runtimePollTick=0,e.pollLive(),e.scheduleLivePoll()}function h(){e.livePollTimer&&(clearTimeout(e.livePollTimer),e.livePollTimer=null)}e.renderLiveFlow=$,e.renderLivePanel=S,e.updateLiveStrip=b,e.patchLiveUI=s,e.pollLive=g,e.startLivePoll=p,e.stopLivePoll=h}function $e(e){function $(g){return e.state._syncingLinkIds.has(String(g))}function S(){let g=document.getElementById("ops-stack");if(!g)return;let p=Date.now(),h=Object.values(e.state._operations||{}).filter(r=>r.status==="running"||r.finishedAt&&p-r.finishedAt<8e3).slice(0,5);if(!h.length){g.innerHTML="",g.hidden=!0;return}g.hidden=!1,g.innerHTML=h.map(r=>{let a=Math.round((r.progress||0)*100),n=r.status==="running"?"is-running":r.status==="error"?"is-error":"is-done",u=r.status==="running"?"Working":r.status==="error"?"Failed":"Done";return`<div class="ops-card ${n}" data-op-id="${e.esc(r.id)}">
        <div class="ops-card__head">
          <span class="ops-card__title">${e.esc(r.title)}</span>
          <span class="ops-card__status">${u}</span>
        </div>
        <p class="ops-card__detail">${e.esc(r.detail||"")}</p>
        ${r.status==="running"?`<div class="ops-card__bar" role="progressbar" aria-valuenow="${a}" aria-valuemin="0" aria-valuemax="100"><span style="width:${a}%"></span></div>`:""}
      </div>`}).join("")}async function b(g,p,h={}){let r=g;e.state._operations[r]={id:r,title:p,detail:"Scanning repository\u2026",progress:0,status:"running"},h.linkId!=null&&e.state._syncingLinkIds.add(String(h.linkId)),e.renderOpsStack(),h.worldId&&e.currentView==="world"&&e.render();try{for(;;){let a=await e.api(`/sync-jobs/${encodeURIComponent(g)}/batch`,{method:"POST",body:JSON.stringify({batch_size:8}),timeoutMs:18e4}),n=e.state._operations[r];if(n&&(n.progress=a.progress||0,n.detail=a.message||`${a.imported||0} files imported`,n.status=a.status==="failed"?"error":a.done?"done":"running"),e.renderOpsStack(),a.done)break}}catch(a){let n=e.state._operations[r];throw n&&(n.status="error",n.detail=a.message||"Sync failed",n.finishedAt=Date.now()),e.renderOpsStack(),a}finally{let a=e.state._operations[r];a&&!a.finishedAt&&(a.finishedAt=Date.now()),h.linkId!=null&&e.state._syncingLinkIds.delete(String(h.linkId)),e.renderOpsStack();try{await e.refresh(),h.worldId&&await e.reloadVault(h.worldId,{force:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.patchAgentsVaultPanel(),e.updateBadges()}catch{}setTimeout(()=>{delete e.state._operations[r],e.renderOpsStack()},8e3)}}async function s(g){let p=await e.api(`/worlds/${encodeURIComponent(g)}/sync-jobs`).catch(()=>({jobs:[]}));for(let h of p.jobs||[])!h?.id||e.state._operations[h.id]||e.runGithubSyncJob(h.id,`Syncing ${h.full_name}`,{worldId:g,linkId:h.link_id}).catch(console.error)}e.isLinkSyncing=$,e.renderOpsStack=S,e.runGithubSyncJob=b,e.resumeActiveSyncJobs=s}function Se(e){function $(){e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit"}async function S(g,p,h){let r=e.$("#md-editor-dialog");if(!(!r||!g||!p)){e.mdEditorState={mode:"vault",artifactId:null,worldId:g,docId:p,editMode:!1},e.$("#md-dialog-title").textContent=h||"Document",e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit",e.$("#md-dialog-preview").innerHTML="<p class='body-md muted'>Loading\u2026</p>",r.showModal();try{let n=(await e.api(`/worlds/${encodeURIComponent(g)}/vault/documents/${encodeURIComponent(p)}/content`,{timeoutMs:2e4})).content||"";e.$("#md-dialog-source").value=n;let u=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(u,n)}catch(a){e.$("#md-dialog-preview").innerHTML=`<p class="body-md" style="color:var(--color-warn)">${e.esc(a.message||"Could not load document")}</p>`}}}async function b(){let g=e.$("#md-dialog-source")?.value??"";if(e.mdEditorState.mode==="vault"&&e.mdEditorState.worldId&&e.mdEditorState.docId){await e.api(`/worlds/${encodeURIComponent(e.mdEditorState.worldId)}/vault/documents/${encodeURIComponent(e.mdEditorState.docId)}`,{method:"PATCH",body:JSON.stringify({content:g}),timeoutMs:15e3});let h=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(h,g),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit";return}if(!e.mdEditorState.artifactId)return;await e.api(`/artifacts/${e.mdEditorState.artifactId}/content`,{method:"PUT",body:JSON.stringify({content:g}),timeoutMs:15e3});let p=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(p,g),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}function s(){e.$("#md-dialog-close")?.addEventListener("click",()=>{e.$("#md-editor-dialog")?.close(),e.resetMdEditorDialog()}),e.$("#md-dialog-mode")?.addEventListener("click",async()=>{if(e.mdEditorState.mode!=="vault"&&!e.mdEditorState.artifactId)return;e.mdEditorState.editMode=!e.mdEditorState.editMode;let g=e.$("#md-dialog-source"),p=e.$("#md-dialog-preview");if(e.mdEditorState.editMode)g.hidden=!1,p.hidden=!0,e.$("#md-dialog-save").hidden=!1,e.$("#md-dialog-mode").textContent="Preview";else{let h=g?.value??"";await window.FOSMarkdown?.renderInto?.(p,h),g.hidden=!0,p.hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}}),e.$("#md-dialog-save")?.addEventListener("click",()=>e.saveMdEditor().catch(g=>alert(g.message)))}e.resetMdEditorDialog=$,e.openVaultDocViewer=S,e.saveMdEditor=b,e.initMdEditorDialog=s}function ke(e){function $(){let r=e.state._nudges||[];return r.length?`<section class="driver-card span-12 up-next-panel">
      <p class="caption-uppercase">Up next</p>
      <p class="body-md muted">Reminders, follow-ups, approvals, and vault prompts for your active world.</p>
      <ul class="up-next-list">${r.slice(0,8).map((n,u)=>`
      <li class="up-next-item${(n.priority||9)<=2?" is-urgent":""}">
        <div class="up-next-item__body">
          <p class="up-next-item__title">${e.esc(n.title)}</p>
          <p class="up-next-item__meta muted">${e.esc(n.body||"")}</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-nudge-index="${u}">Open</button>
      </li>`).join("")}</ul>
    </section>`:""}function S(r){let a=e.state._nudges?.[Number(r)];if(!a)return;if(a.kind==="vault_leads"&&a.meta?.doc_id){e.tagVaultDocInChat(a.meta.doc_id,a.meta.world_id,a.title,"");return}let n=a.action||"chat";if(n==="crm")return e.goView("crm");if(n==="goals")return e.goView("goals");if(n==="approvals")return e.goView("approvals");if(n==="documents")return e.goView("documents");if(n==="world")return e.goView("world");e.goView(n)}function b(r,a,n){let u=document.getElementById(r);if(!u)return;let i=u.closest(".chart-panel");if(!i)return;let f=i.querySelector(".chart-empty");f||(f=document.createElement("p"),f.className="chart-empty muted body-md",i.appendChild(f)),f.textContent=a,f.hidden=!n,u.hidden=n}function s(){let r=window.innerWidth<640,a=e.state._world?.tools_by_category||e.state.about?.tools_by_category||{},n=Object.entries(a).slice(0,r?5:8);n.length&&e.$("#chart-tools")?(e.chartPanelNote("chart-tools","",!1),FOSCharts.bar("chart-tools",n.map(([I])=>I),n.map(([,I])=>I),{colors:e.CHART_COLORS})):e.chartPanelNote("chart-tools","No tool data yet.",!0);let u=e.state.snapshot?.crm?.by_status||{},i=Object.entries(u).filter(([,I])=>I>0).map(([I,y])=>({label:I,value:y}));i.length&&e.$("#chart-crm")?(e.chartPanelNote("chart-crm","",!1),FOSCharts.donut("chart-crm",i,{centerLabel:"contacts",colors:e.CHART_COLORS})):e.chartPanelNote("chart-crm","No CRM contacts yet \u2014 add leads in Chat or CRM.",!0);let O=[...e.state.usage_history||[]].reverse().map(I=>I.llm_calls||I.calls||0);O.length&&e.$("#chart-usage")?(e.chartPanelNote("chart-usage","",!1),FOSCharts.spark("chart-usage",O)):e.chartPanelNote("chart-usage","No LLM usage in the last 7 days.",!0)}function g(){let r=e.state.config||{},a=e.state.snapshot?.approvals_pending||0,n=r.agent_paused;return`
      <section class="driver-card span-12 operator-panel" aria-label="Direct actions">
        <div class="operator-panel__head">
          <div>
            <p class="section-eyebrow">You drive</p>
            <h3 class="title-sm">Direct controls</h3>
            <p class="body-md muted">Manage worlds, CRM, goals, and agent policy yourself. Chat is optional \u2014 use it when you want help.</p>
          </div>
          <div class="operator-panel__status">
            <span class="pill ${n?"warn":"ok"}">${n?"Agent paused":"Agent on standby"}</span>
            <span class="pill info">${e.esc(r.autonomy_level||"balanced")} autonomy</span>
          </div>
        </div>
        <div class="operator-grid">
          <button type="button" class="operator-card" data-operator="create-world">
            <span class="operator-card__title">New world</span>
            <span class="operator-card__desc">Add a venture, project, or idea</span>
          </button>
          <button type="button" class="operator-card" data-operator="add-contact">
            <span class="operator-card__title">Add contact</span>
            <span class="operator-card__desc">CRM lead or relationship</span>
          </button>
          <button type="button" class="operator-card" data-operator="add-goal">
            <span class="operator-card__title">New goal</span>
            <span class="operator-card__desc">Track an outcome you own</span>
          </button>
          <button type="button" class="operator-card" data-operator="add-reminder">
            <span class="operator-card__title">Reminder</span>
            <span class="operator-card__desc">Schedule a follow-up</span>
          </button>
          <button type="button" class="operator-card" data-operator="settings">
            <span class="operator-card__title">Agent policy</span>
            <span class="operator-card__desc">Autonomy &amp; approvals</span>
          </button>
          <button type="button" class="operator-card${a?" operator-card--alert":""}" data-operator="approvals">
            <span class="operator-card__title">Approvals${a?` (${a})`:""}</span>
            <span class="operator-card__desc">Review before agents act</span>
          </button>
        </div>
      </section>`}function p(r){if(e.state.ui||(e.state.ui={}),r==="create-world"){e.state.ui.worldCreateOpen=!0,e.currentView==="world"?(e.render(),requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"}))):(e.goView("world"),e.state._scrollWorldCreate=!0);return}if(r==="add-contact"){e.state.ui.crmFormOpen=!0,e.currentView==="crm"?e.render():e.goView("crm");return}if(r==="add-goal"){e.state.ui.goalsFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}if(r==="add-reminder"){e.state.ui.reminderFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}r==="settings"&&e.goView("settings"),r==="approvals"&&e.goView("approvals")}function h(){let r=e.state.snapshot||{},a=r.crm||{},n=e.state.finance||{},u=e.state.usage||{},i=e.state.about||{},f=e.state.config||{},O=r.approvals_pending||0,I=n.set?`<span class="pill ${n.status==="healthy"?"ok":n.status==="warning"?"warn":"info"}">${e.esc(n.status)}</span>`:"",y=n.set?n.runway||(n.runway_months!=null?n.runway_months+" mo":"\u2014"):null,w=(e.state.goals||[]).slice(0,5).map(j=>`<li>${e.esc(j.title)}</li>`).join("")||"<li class='muted'>No active goals \u2014 add one in Goals or use Direct controls.</li>",A=O>0?`<div class="spec-cell race-position-cell"><dt>Approvals</dt><dd>${O}</dd></div>`:'<div class="spec-cell"><dt>Approvals</dt><dd>0</dd></div>',L=e.state.live||{},M=e.state._agents||{};return`<div class="dashboard-grid">
        ${e.renderUpNext()}
        ${e.renderOperatorPanel()}
        <section class="driver-card span-8">
          ${e.renderLivePanel(L)}
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">World state</p>
          <p class="world-meta" style="margin-top:var(--space-xxs)">Updated ${e.esc(r.ts||"now")}</p>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tools</dt><dd>${i.total_tools||0}</dd></div>
            <div class="spec-cell"><dt>Agents</dt><dd>${(M.specialists?.length||4)+1}</dd></div>
            <div class="spec-cell"><dt>Contacts</dt><dd>${a.total_contacts||0}</dd></div>
            ${A}
          </dl>
          <div class="capability-strip" style="margin-top:var(--space-sm)">
            <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Ask agent</button>
            <button type="button" class="button-outline-on-dark button-sm" data-goto="world">Worlds</button>
            <button type="button" class="button-outline-on-dark button-sm" data-goto="documents">Documents</button>
            <button type="button" class="button-outline-on-dark button-sm" data-goto="crm">CRM</button>
            <button type="button" class="button-outline-on-dark button-sm" data-goto="goals">Goals</button>
          </div>
        </section>
        <section class="driver-card span-4 chart-panel">
          <p class="caption-uppercase">Tools by category</p>
          <canvas id="chart-tools" role="img" aria-label="Bar chart of tools by category"></canvas>
        </section>
        <section class="driver-card span-4 chart-panel">
          <p class="caption-uppercase">CRM pipeline</p>
          <div class="donut-wrap"><canvas id="chart-crm" role="img" aria-label="CRM contacts by status"></canvas></div>
        </section>
        <section class="driver-card span-4 chart-panel">
          <p class="caption-uppercase">LLM usage (7d)</p>
          <canvas id="chart-usage" role="img" aria-label="LLM calls sparkline"></canvas>
        </section>
        <section class="driver-card span-8">
          <p class="caption-uppercase">Recent activity</p>
          <div class="activity-timeline">${(e.state.actions||[]).slice(0,8).map(j=>`<div class="activity-timeline__row"><span class="mono">${e.esc(j.tool_name)}</span><span class="muted">${e.esc((j.created_at||"").slice(11,19))}</span></div>`).join("")||"<p class='muted'>No tool actions yet</p>"}</div>
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">Specialist status</p>
          <div class="specialist-chips">${e.listSpecialists(M).map(j=>`<span class="specialist-chip${e.agentBusy(L,j.id)?" is-busy":""}">${e.esc(j.label)}</span>`).join("")}</div>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents" style="margin-top:var(--space-sm)">Open agents</button>
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Runway ${I}</p>
          ${y?`<dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Cash</dt><dd class="small">${e.fmtMoney(n.cash)}</dd></div>
            <div class="spec-cell"><dt>Burn</dt><dd class="small">${e.fmtMoney(n.monthly_burn)}</dd></div>
            <div class="spec-cell"><dt>MRR</dt><dd class="small">${e.fmtMoney(n.mrr)}</dd></div>
            <div class="spec-cell"><dt>Runway</dt><dd class="small">${e.esc(y)}</dd></div>
          </dl>`:'<p class="body-md" style="margin-top:var(--space-sm)">Set cash, burn, and MRR in Settings or ask the agent to track runway.</p>'}
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Active goals</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${w}</ul>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tasks open</dt><dd>${r.tasks_open||0}</dd></div>
            <div class="spec-cell"><dt>LLM today</dt><dd class="small">${u.llm_calls||0}</dd></div>
          </dl>
        </section>
      </div>`}e.renderUpNext=$,e.handleNudgeAction=S,e.chartPanelNote=b,e.drawDashboardCharts=s,e.renderOperatorPanel=g,e.openOperatorAction=p,e.renderDashboard=h}function Ce(e){function $(){return localStorage.getItem("fos_chat_session")||""}function S(k){k?localStorage.setItem("fos_chat_session",k):localStorage.removeItem("fos_chat_session")}function b(k){k?.session_id&&e.setChatSessionId(k.session_id)}async function s(){let k=e.chatSessionId();if(k)try{let l=await e.api(`/history/sessions/${k}`);l?.messages?.length&&(e.chatHistory=l.messages.map(m=>({role:m.role==="assistant"?"agent":m.role,text:m.content})),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)))}catch{}}function g(k={}){let l={world_id:e.currentWorldId(),rag_mode:e.currentRagMode(),session_id:e.chatSessionId()||void 0,specialist:e.currentSpecialistId()||void 0,...k},m=(e.state._chatAttachments||[]).filter(_=>_?.doc_id);return m.length&&(l.attachments=m.map(_=>({type:"vault",doc_id:_.doc_id,title:_.title,path:_.path}))),l}function p(k){if(k.pending)return`<div class="msg-pending"><span class="live-pulse" aria-hidden="true"></span> ${e.esc(k.pendingLabel||"Agent working\u2026")}</div>`;let l=k.text||"";if(k.role==="agent"||k.role==="assistant"){let m=window.FOSMarkdown?.render?.(l)||e.esc(l),_=(k.artifacts||[]).map(C=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${C.id}">${e.esc(C.title||C.kind||"Document")}</button>`).join("");return`<div class="msg-md">${m}</div>${_?`<div class="msg-artifacts">${_}</div>`:""}`}return`<div class="msg-plain">${e.esc(l)}</div>`}function h(k,l){return`msg:${k}:${e.chatSessionId()||"default"}:${l}`}function r(k){return k<=0?e.MSG_READ_INITIAL_LINES:k===1?e.MSG_READ_INITIAL_LINES+e.MSG_READ_EXPAND_LINES:1/0}function a(k){let l=k||document.getElementById("content");l&&(e.state._msgExpand||(e.state._msgExpand={}),l.querySelectorAll(".msg-read-more-host").forEach(m=>{let _=m.querySelector(":scope > .msg-md, :scope > .msg-plain"),C=m.querySelector(".msg-read-more");if(!_||!C)return;let D=m.dataset.msgScope||"chat",E=m.dataset.msgIndex??"0",G=e.msgExpandKey(D,E),q=e.state._msgExpand[G]||0,te=parseFloat(getComputedStyle(_).lineHeight)||21,Z=Math.max(1,Math.round(_.scrollHeight/te)),ae=e.msgReadLineLimit(q);if(C.dataset.msgReadMore=G,ae>=Z||q>=2){_.classList.remove("msg-body--clamped"),_.style.maxHeight="",C.hidden=!0;return}_.classList.add("msg-body--clamped"),_.style.maxHeight=`${ae*te}px`,C.hidden=!1,C.textContent="Read more"}))}function n(k){return k?.length?`<div class="msg-artifacts">${k.map(l=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${l.id}">${e.esc(l.title||l.kind||"File")}</button>`).join("")}</div>`:""}async function u(){let k=e.currentWorldId(),l=k&&k!=="root"?`?world_id=${encodeURIComponent(k)}`:"";try{let m=await e.api(`/history${l}`,{timeoutMs:15e3});e.state._chatSessions=m.sessions||[]}catch{e.state._chatSessions=e.state._chatSessions||[]}}function i(){let k=e.state._chatSessions||[],l=e.chatSessionId();return`<section class="chat-sessions-strip driver-card">
      <div class="chat-sessions-strip__head">
        <p class="caption-uppercase">Chats</p>
        <button type="button" class="button-primary button-sm" data-new-chat-session>+ New</button>
      </div>
      <div class="chat-sessions-strip__list">${k.map(_=>`
      <button type="button" class="chat-session-chip${_.id===l?" is-active":""}" data-chat-session="${e.esc(_.id)}">
        <span class="chat-session-chip__title">${e.esc(_.title||"Conversation")}</span>
        <span class="chat-session-chip__meta">${e.fmtHistoryTime(_.updated_at)}</span>
      </button>`).join("")||"<span class='muted body-md'>No previous chats</span>"}</div>
    </section>`}async function f(k){e.openDocumentsWorkspace(k)}function O(){let k=e.state._chatAttachments||[];return k.length?`<div class="chat-attachments">${k.map((l,m)=>`<span class="chat-attachment-chip">
        <span>\u{1F4CE} ${e.esc(l.title||"File")}</span>
        <button type="button" class="chat-attachment-chip__remove" data-remove-attachment="${m}" aria-label="Remove attachment">\xD7</button>
      </span>`).join("")}</div>`:""}async function I(){let k=e.currentWorldId();if(!k||k==="root"){alert("Select a project world (not Main) to attach vault documents.");return}await e.ensureVaultForWorld(k);let l=e.vaultPayload()||{},m=l.facets||l.folders||[],_=[];for(let E of m)for(let G of E.documents||[])e.isMarkdownFilename(G.filename||G.github_path)&&_.push(G);let C=e.$("#vault-picker-list"),D=e.$("#vault-picker-dialog");!C||!D||(C.innerHTML=_.length?_.map(E=>`
      <button type="button" class="vault-picker-item" data-pick-vault-doc="${E.id}" data-world-id="${e.esc(k)}" data-doc-title="${e.esc(E.title)}" data-doc-path="${e.esc(E.github_path||E.filename||"")}">
        <strong>${e.esc(E.title)}</strong>
        <span class="muted">${e.esc(E.github_path||E.filename||"")}</span>
      </button>`).join(""):"<p class='body-md muted'>No markdown docs in vault \u2014 link and sync a GitHub repo in Worlds.</p>",D.showModal())}async function y(k){for(;;){let l=await e.api(`/chat/jobs/${encodeURIComponent(k)}`,{timeoutMs:2e4}),m=l.job;if(!m)break;if(e.state._activeJob=m,e.patchLiveUI(e.state.live),e.patchChatJobBubble(m),["completed","failed","cancelled"].includes(m.status))return{job:m,pending_approvals:l.pending_approvals};await e.sleep(1200)}return null}function w(k){let l=e.chatHistory.findIndex(_=>_.jobId===k.id);if(l<0)return;k.status==="running"?(e.chatHistory[l].pending=!0,e.chatHistory[l].pendingLabel=k.phase||"Agent working\u2026"):(e.chatHistory[l].pending=!1,e.chatHistory[l].text=k.result||k.error||"(no response)",e.chatHistory[l].artifacts=k.artifacts||[],k.session_id&&e.setChatSessionId(k.session_id));let m=e.$("#chat-messages");m&&e.currentView==="chat"&&(m.innerHTML=e.renderChatMessagesInner(),window.FOSMarkdown?.enhance?.(m),e.initMsgReadMore(m),m.scrollTop=m.scrollHeight),e.updateLiveStrip({active:k.status==="running",phase:k.phase}),e.$$("#chat-live-panel-phase, [id$='-phase']").forEach(_=>{_&&(_.textContent=k.phase||"Idle")})}function A(){return e.chatHistory.length?e.chatHistory.map((l,m)=>l.pending?`<div class="msg ${l.role} is-pending"><div class="msg-bubble">${e.renderMessageHtml(l)}</div></div>`:`<div class="msg ${l.role}">
        <div class="msg-bubble msg-read-more-host" data-msg-scope="chat" data-msg-index="${m}">
          ${e.renderMessageHtml(l)}
          <button type="button" class="msg-read-more" hidden>Read more</button>
        </div>
      </div>`).join(""):""}async function L(k,{direct:l=!1,specId:m=""}={}){let _=e.chatPayload({message:k});l&&m&&(_.specialist=m);let C=await e.api("/chat/async",{method:"POST",body:JSON.stringify(_),timeoutMs:2e4});e.state._chatAttachments=[];let D=C.job;e.chatHistory.push({role:"agent",text:"",pending:!0,jobId:D.id,pendingLabel:D.phase||"Starting\u2026"}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.state._activeJob=D,e.render(),e.startLivePoll();try{let E=await e.pollAgentJob(D.id);E?.job?.session_id&&e.setChatSessionId(E.job.session_id),E?.pending_approvals&&(e.state.approvals=E.pending_approvals,e.updateBadges()),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.loadChatSessionsList()}finally{e.state._activeJob=null,e.pollLive(),e.currentView==="chat"&&e.render()}}async function M(k){let l=k||e.state._activeJob?.id;if(l)try{await e.api(`/chat/jobs/${encodeURIComponent(l)}/cancel`,{method:"POST",timeoutMs:1e4}),e.state._activeJob?.id===l?await e.pollAgentJob(l):e.pollLive()}catch(m){alert(m.message)}}function j(){let k=e.state._agents||{},l=e.routingMeta(k),m=e.routingLabel(k),_=e.isDirectSpecialist(),C=e.listSpecialists(k),D=e.state.ragMode||"auto",E=e.RAG_MODES.find(x=>x.id===D)||e.RAG_MODES[0],G=e.renderChatMessagesInner(),q=e.state.live||{},te=!e.chatHistory.length,Z=!!e.state._activeJob?.active||e.chatHistory.some(x=>x.pending),ae=e.collectAgentRuns().slice(0,4);return`<div class="chat-shell">
      <header class="chat-header driver-card">
        <div>
          <p class="section-eyebrow">Optional \xB7 agent assist</p>
          <h2 class="title-md">Ask agent</h2>
        </div>
        <div class="chat-header__meta">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          <span class="badge-pill agent-routing-badge">${e.esc(m)}</span>
          ${Z?'<span class="badge-pill badge-pill--alert">Working</span>':""}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents">Change specialist</button>
        </div>
      </header>
      ${e.renderChatSessionsList()}
      <div class="chat-layout chat-layout--rich">
        <div class="chat-wrap">
          <div class="chat-messages${te?" is-empty":""}" id="chat-messages">
            ${te?`<div class="chat-empty">
              <p class="title-md">Supervisor ready</p>
              <p class="body-md">Routing: <strong>${e.esc(m)}</strong> \xB7 Retrieval: <strong>${e.esc(E.label)}</strong></p>
              <div class="capability-strip chat-empty__chips">
                <button type="button" class="delegate-hint" data-goto="crm">CRM</button>
                <button type="button" class="delegate-hint" data-goto="goals">Goals</button>
                <button type="button" class="delegate-hint" data-goto="world">Vault / Worlds</button>
                <button type="button" class="delegate-hint" data-goto="documents">Documents</button>
                <button type="button" class="delegate-hint" data-goto="agents">Agents</button>
              </div>
            </div>`:G}
          </div>
          <div class="chat-composer driver-card">
            ${e.renderChatAttachmentChips()}
            <div class="chat-composer__controls">
              <label class="chat-control">
                <span class="caption-uppercase">Specialist</span>
                <select id="chat-specialist-select" class="world-select agent-select" aria-label="Specialist routing"></select>
              </label>
              ${e.renderRagModeSelect("rag-mode-select")}
            </div>
            <div class="chat-input-row">
              <textarea class="text-input-on-dark chat-input" id="chat-input" placeholder="${_?`Task for ${e.esc(l.label)}\u2026`:"Message supervisor\u2026"}" rows="3"${Z?" disabled":""}></textarea>
              <button class="button-primary" id="chat-send"${Z?" disabled":""}>${_?`Run ${e.esc(l.label)}`:"Send"}</button>
            </div>
            <div class="chat-toolbar">
              <label class="button-outline-on-dark button-sm upload-label">Upload<input type="file" id="chat-file" hidden accept=".pdf,.docx,.txt,.md,.csv,.json"></label>
              <button type="button" class="button-outline-on-dark button-sm" data-open-vault-picker>Attach vault</button>
              <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New chat</button>
              ${Z?'<button type="button" class="button-outline-on-dark button-sm" data-cancel-active-job>Stop</button>':""}
              <button type="button" class="button-outline-on-dark button-sm" data-goto="world">Worlds</button>
            </div>
          </div>
          <section class="driver-card chat-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-chat" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </div>
        <aside class="chat-rail">
          ${e.renderLivePanel(q,"chat-live-panel")}
          <section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Specialists</p>
            <div class="specialist-chips" style="margin-top:var(--space-xxs)">${C.map(x=>`<span class="specialist-chip${e.currentSpecialistId()===x.id?" is-selected":""}${e.agentBusy(q,x.id)?" is-busy":""}">${e.esc(x.label)}</span>`).join("")}</div>
          </section>
          ${ae.length?`<section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Recent runs</p>
            <div class="activity-timeline">${ae.map(x=>`<div class="activity-timeline__row"><span>${e.esc((x.agent||"").toUpperCase())}</span><span class="muted">${e.esc((x.task||"").slice(0,40))}</span></div>`).join("")}</div>
          </section>`:""}
        </aside>
      </div>
    </div>`}function U(){requestAnimationFrame(()=>{let k=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),l=k?.[k.length-1];FOSMotion?.animateNewMessage?.(l)})}async function Q(){try{await e.api("/auth/logout",{method:"POST",body:"{}"})}catch{}e.showPinGate()}async function se(){let k=e.$("#chat-input"),l=(k?.value||"").trim();if(!l||e.chatHistory.some(G=>G.pending))return;let m=e.currentSpecialistId(),_=e.routingMeta(e.state._agents||{}),C=!!m;k.value="",e.chatHistory.push({role:"user",text:l}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render(),e.animateLatestChatMessage();let D=e.$("#chat-send"),E=C?`Run ${_.label}`:"Send";D&&(D.disabled=!0,D.textContent="\u2026");try{await e.startAgentJob(l,{direct:C,specId:m})}catch(G){e.chatHistory.push({role:"system",text:"Error: "+G.message}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render()}D&&(D.disabled=!1,D.textContent=E),e.animateLatestChatMessage()}async function H(){let k=!e.state.config?.agent_paused;await e.api("/agent/pause",{method:"POST",body:JSON.stringify({paused:k})}),await e.refresh(),e.render()}e.chatSessionId=$,e.setChatSessionId=S,e.applyChatSessionResponse=b,e.loadChatFromServer=s,e.chatPayload=g,e.renderMessageHtml=p,e.msgExpandKey=h,e.msgReadLineLimit=r,e.initMsgReadMore=a,e.renderArtifactLinks=n,e.loadChatSessionsList=u,e.renderChatSessionsList=i,e.openMdEditor=f,e.renderChatAttachmentChips=O,e.openVaultAttachPicker=I,e.pollAgentJob=y,e.patchChatJobBubble=w,e.renderChatMessagesInner=A,e.startAgentJob=L,e.cancelActiveJob=M,e.renderChat=j,e.animateLatestChatMessage=U,e.logoutPin=Q,e.sendChat=se,e.togglePause=H}function Ie(e){function $(a){a!=null&&(e.state._documentsSelectedId=Number(a)),e.goView("documents")}function S(){let a=e.state._artifacts||[],n=e.state._documentsSelectedId,u=a.find(y=>y.id===n),i=e.state._documentDraft??"",f=e.documentsEditMode,O=a.length?a.map(y=>`
      <button type="button" class="docs-list-item${y.id===n?" is-active":""}" data-select-document="${y.id}">
        <span class="badge-pill">${e.esc(y.kind||"md")}</span>
        <span class="docs-list-item__title">${e.esc(y.title||"Untitled")}</span>
        <span class="docs-list-item__meta muted">${e.fmtHistoryTime(y.created_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No documents yet. Create one or upload a file.</p>",I=`<div class="docs-empty">
      <p class="title-sm">Document workspace</p>
      <p class="body-md muted">Select a document from the list, or create a new markdown file.</p>
      <button type="button" class="button-primary button-sm" data-docs-action="new">+ New document</button>
    </div>`;return u&&(I=`
        <div class="docs-editor__toolbar">
          <input type="text" class="text-input-on-dark docs-title-input" id="docs-title-input" value="${e.esc(u.title||"Untitled")}" aria-label="Document title">
          <select class="text-input-on-dark field-select docs-world-select" id="docs-world-select" aria-label="Project">
            ${e.renderWorldOptionsForDocs(u.world_id||"root")}
          </select>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="toggle">${f?"Preview":"Edit"}</button>
          <button type="button" class="button-primary button-sm" data-docs-action="save">Save</button>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="memory">Save to memory</button>
        </div>
        <div class="docs-editor__body">
          ${f?`<textarea id="docs-source" class="docs-source text-input-on-dark" aria-label="Document source">${e.esc(i)}</textarea>`:'<div id="docs-preview" class="md-content msg-md docs-preview"></div>'}
        </div>`),`
      <header class="driver-card docs-header">
        <div>
          <p class="section-eyebrow">Markdown workspace</p>
          <h2 class="title-md">Documents</h2>
          <p class="body-md muted">View, edit, upload, and save agent-created files to memory or a project.</p>
        </div>
      </header>
      <div class="docs-workspace">
        <aside class="driver-card docs-list-panel">
          <div class="docs-list-panel__head">
            <button type="button" class="button-primary button-sm" data-docs-action="new">+ New</button>
            <label class="button-outline-on-dark button-sm upload-label">Upload<input type="file" id="docs-upload" hidden accept=".md,.txt,.markdown,.pdf,.docx,.csv,.json"></label>
          </div>
          <div class="docs-list">${O}</div>
        </aside>
        <section class="driver-card docs-editor-panel">${I}</section>
      </div>`}async function b(){let a=prompt("Document title","Untitled");if(!a)return;let n=e.currentWorldId(),u=await e.api("/artifacts",{method:"POST",body:JSON.stringify({title:a,content:`# ${a}

`,world_id:n&&n!=="root"?n:null}),timeoutMs:15e3});e.state._documentsSelectedId=u.artifact?.id,e.documentsEditMode=!0,await e.loadViewData("documents"),e.render()}async function s(a){if(!a)return;let n=new FormData;n.append("file",a);let u=e.currentWorldId();u&&u!=="root"&&n.append("world_id",u);let i=await e.apiUpload("/artifacts",n);e.state._documentsSelectedId=i.artifact?.id,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function g(){let a=e.state._documentsSelectedId;if(!a)return;let n=document.getElementById("docs-source")?.value??e.state._documentDraft??"",u=document.getElementById("docs-title-input")?.value??"Untitled",i=document.getElementById("docs-world-select")?.value??"root";await e.api(`/artifacts/${a}/content`,{method:"PUT",body:JSON.stringify({content:n}),timeoutMs:15e3}),await e.api(`/artifacts/${a}`,{method:"PATCH",body:JSON.stringify({title:u,world_id:i==="root"?null:i}),timeoutMs:15e3}),e.state._documentDraft=n,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function p(){let a=e.state._documentsSelectedId;if(!a)return;e.documentsEditMode&&await e.saveCurrentDocument();let n=await e.api(`/artifacts/${a}/memory`,{method:"POST",body:"{}",timeoutMs:2e4});alert(`Saved to memory (${n.collection||"documents"}).`)}async function h(a){e.state._documentsSelectedId=Number(a),e.documentsEditMode=!1;try{let n=await e.api(`/artifacts/${a}/content`,{timeoutMs:15e3});e.state._documentDraft=n.content||""}catch(n){e.state._documentDraft="",alert(n.message||"Could not load document")}e.render()}function r(a){let n=(a||"").toLowerCase();return n.endsWith(".md")||n.endsWith(".markdown")||n.endsWith(".rst")}e.openDocumentsWorkspace=$,e.renderDocuments=S,e.createNewDocument=b,e.uploadDocumentFile=s,e.saveCurrentDocument=g,e.saveDocumentToMemory=p,e.selectDocument=h,e.isMarkdownFilename=r}function Ae(e){function $(l){let m=l?.supervisor||{};return{id:"supervisor",label:"Supervisor",role:"aggregator",tool_count:l?.total_tools,brief:m.role||"Orchestrates specialists \u2014 picks who to run when routing is Auto"}}function S(l){let m=l?.specialists||[];return(m.length?m:e.DEFAULT_SPECIALISTS).map(C=>({...C,label:C.label||C.id}))}function b(){let l=e.listSpecialists(e.state._agents||{}),m=e.state.selectedSpecialist??"";m&&!l.some(G=>G.id===m)&&(m=""),e.state.selectedSpecialist=m;let C=`<option value="">Auto \u2014 supervisor decides</option>${l.map(G=>`<option value="${e.esc(G.id)}">${e.esc(G.label)}</option>`).join("")}`,D=e.$("#specialist-select-agents");D&&(D.innerHTML=C,D.value=m);let E=e.$("#chat-specialist-select");E&&(E.innerHTML=C,E.value=m)}function s(l){let m=e.currentSpecialistId();return m?`Supervisor \u2192 ${e.listSpecialists(l||e.state._agents||{}).find(C=>C.id===m)?.label||m}`:"Supervisor \xB7 auto-route"}function g(l){let m=e.state._agents||l||{},_=e.currentSpecialistId();return _?e.listSpecialists(m).find(C=>C.id===_)||{id:_,label:_,role:"specialist"}:e.supervisorMeta(m)}function p(l,m){let _=l?.jobs||[],C=String(m||"");if(_.some(E=>E.status==="running"&&(E.specialist===C||C==="supervisor"&&E.mode==="chat")))return!0;let D=l?.active?String(l.actor||""):"";return C==="supervisor"?D==="user":D===`subagent:${C}`||C&&D.includes(C)}function h(l){let m=e.AGENT_ROLES[l]||{label:l||"Specialist",cls:""};return`<span class="agent-role-badge ${m.cls}">${e.esc(m.label)}</span>`}function r(l,m){let _=e.AGENT_ROLES[m]||e.AGENT_ROLES.aggregator,C=e.AGENT_INITIALS[l]||(l||"??").slice(0,2).toUpperCase();return`<span class="agent-avatar ${_.avatar||"agent-avatar--aggregator"}" aria-hidden="true">${e.esc(C)}</span>`}function a(l,m){let _=(m||[]).find(D=>D.agent===l);return _?.ts?new Date(typeof _.ts=="number"&&_.ts<1e12?_.ts*1e3:_.ts).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function n(){let l=e.state._agentRunsApi||[],_=[...e.readJsonStorage("fos_agent_runs",[])];for(let C of l)_.some(D=>D.id===C.id)||_.push({...C,source:"trace"});return _.sort((C,D)=>(D.ts||0)-(C.ts||0)),_.slice(0,50)}function u(l){let m=e.readJsonStorage("fos_agent_runs",[]);m.unshift(l),localStorage.setItem("fos_agent_runs",JSON.stringify(m.slice(0,50)))}function i(l){let m=!e.currentSpecialistId();return`<button type="button" class="fleet-card fleet-card--auto${m?" is-selected":""}" data-select-specialist="" aria-pressed="${m}">
      ${m?'<span class="fleet-card__active-label">Routing</span>':""}
      <div class="fleet-card__top">
        <span class="agent-avatar agent-avatar--aggregator" aria-hidden="true">AU</span>
        <span class="fleet-card__status" title="Supervisor routes"></span>
      </div>
      <div class="fleet-card__name">Auto</div>
      <span class="agent-role-badge agent-role--aggregator">Supervisor picks</span>
      <div class="fleet-card__meta"><span>Default routing</span></div>
    </button>`}function f(l,m){let _=e.supervisorMeta(l),C=e.agentBusy(m,"supervisor");return`<div class="supervisor-banner driver-card">
      <div class="agent-card-title-row">
        ${e.agentAvatar("supervisor",_.role)}
        <div>
          <h2 class="title-md">${e.esc(_.label)} <span class="supervisor-main-tag">Main agent</span></h2>
          <p class="world-meta">${e.esc((_.brief||"").slice(0,140))}</p>
        </div>
      </div>
      <span class="agent-status ${C?"busy":"ready"}">${C?"Working":"Always on"}</span>
    </div>`}function O(l,m,_,C){let D=e.agentBusy(m,l.id),E=_===l.id,G=e.lastRunForAgent(l.id,C);return`<button type="button" class="fleet-card${D?" is-busy":""}${E?" is-selected":""}" data-select-specialist="${e.esc(l.id)}" aria-pressed="${E}">
      ${E?'<span class="fleet-card__active-label">Direct</span>':""}
      <div class="fleet-card__top">
        ${e.agentAvatar(l.id,l.role)}
        <span class="fleet-card__status ${D?"is-busy":""}" title="${D?"Working":"Idle"}"></span>
      </div>
      <div class="fleet-card__name">${e.esc(l.label)}</div>
      ${l.role?e.agentRoleBadge(l.role):""}
      <p class="fleet-card__brief">${e.esc((l.brief||"").slice(0,72))}</p>
      <div class="fleet-card__meta">
        <span>${l.tool_count??"\u2014"} tools</span>
        ${G?`<span>${e.esc(G)}</span>`:""}
      </div>
    </button>`}function I(l,m,_=!1){let C=e.listSpecialists(l),D=e.currentSpecialistId(),E=e.collectAgentRuns();return _?`<div class="fleet-rail">${e.renderFleetAutoCard(m)}${C.map(G=>e.renderFleetCard(G,m,D,E)).join("")}</div>`:`<div class="agent-grid">${C.map(G=>{let q={...G,label:G.label||G.id};return`<article class="agent-card${e.agentBusy(m,G.id)?" is-busy":""}">
          <div class="agent-card-head">${e.renderFleetCardInner(q,m,E)}</div>
        </article>`}).join("")}</div>`}function y(l,m,_){let C=e.agentBusy(m,l.id),D=e.lastRunForAgent(l.id,_);return`
      <div class="agent-card-title-row">
        ${e.agentAvatar(l.id,l.role)}
        <div><h3>${e.esc(l.label)}</h3>${l.role?e.agentRoleBadge(l.role):""}</div>
      </div>
      <span class="agent-status ${C?"busy":"ready"}">${C?"Working":"Ready"}</span>
      <p class="agent-meta">${l.tool_count??0} tools${D?` \xB7 ${e.esc(D)}`:""}</p>`}function w(l){return l.length?`<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Time</th><th>Agent</th><th>Task</th><th>Duration</th><th>Tools</th><th></th></tr></thead>
      <tbody>${l.map(m=>{let _=m.ts?e.fmtTime(m.ts):"\u2014",C=(m.tools||[]).slice(0,4).join(", "),D=e.state.expandedRunId===m.id;return`<tr class="data-row${D?" is-expanded":""}" data-run-id="${e.esc(m.id)}">
          <td class="mono muted">${e.esc(_)}</td>
          <td><span class="fleet-inline-badge">${e.esc((m.agent||"").toUpperCase())}</span></td>
          <td class="task-cell">${e.esc((m.task||"").slice(0,120))}</td>
          <td class="mono">${m.duration_s?`${m.duration_s}s`:"\u2014"}</td>
          <td class="muted">${e.esc(C||"\u2014")}</td>
          <td><button type="button" class="button-tertiary-text button-sm" data-toggle-run="${e.esc(m.id)}">${D?"Hide":"View"}</button></td>
        </tr>
        ${D?`<tr class="data-row-detail"><td colspan="6"><pre class="run-result mono">${e.esc(m.result||"No output recorded")}</pre></td></tr>`:""}`}).join("")}</tbody>
    </table></div>`:'<div class="empty-state"><p class="title-sm">No specialist runs yet</p></div>'}function A(){let l=e.state._tools||{},m=l.by_category||{};return`<div class="console-split">
      <div class="driver-card">${Object.entries(m).sort((C,D)=>D[1]-C[1]).map(([C,D])=>`<div class="kv-row"><span class="k">${e.esc(C)}</span><span class="v">${D}</span></div>`).join("")||"<p class='muted'>No tools loaded</p>"}</div>
      <div class="driver-card tool-list-compact">${(l.tools||[]).slice(0,24).map(C=>`<div class="tool-chip">${e.esc(C.name)}${C.requires_approval?'<span class="badge-pill">approval</span>':""}</div>`).join("")}</div>
    </div>`}function L(){let l=e.state._crm||{},m=l.pipeline||{},_=l.contacts||[],C=l.followups_due||[],D=Object.entries(m).map(([q,te])=>`<div class="kv-row"><span class="k">${e.esc(q)}</span><span class="v">${te}</span></div>`).join(""),E=C.slice(0,8).map(q=>`<li>${e.esc(q.name)} <span class="muted">${e.esc(q.company||"")}</span></li>`).join("")||"<li class='muted'>None due</li>",G=_.slice(0,10).map(q=>`<tr><td>${e.esc(q.name)}</td><td>${e.esc(q.company||"\u2014")}</td><td>${e.esc(q.status||"\u2014")}</td></tr>`).join("");return`<div class="console-split">
      <section class="driver-card"><p class="caption-uppercase">Pipeline</p>${D||"<p class='muted'>Empty</p>"}
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Follow-ups due</p><ul class="list-plain">${E}</ul></section>
      <section class="driver-card"><p class="caption-uppercase">Contacts (${_.length})</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Company</th><th>Status</th></tr></thead>
        <tbody>${G||"<tr><td colspan='3' class='muted'>No contacts</td></tr>"}</tbody></table></div>
        <button type="button" class="button-outline-on-dark button-sm" data-goto="crm" style="margin-top:var(--space-xs)">Open CRM</button>
      </section>
    </div>`}function M(){let l=e.currentWorldId(),m=e.vaultReadyFor(l)?e.vaultPayload()||{}:{},_=m.folders||m.facets||[],C=e.state._agentsVaultQ||"",D=l!=="root"&&!e.vaultReadyFor(l);return`<div class="console-split">
      <section class="driver-card">
        <p class="caption-uppercase">Vault \xB7 ${e.esc(e.activeWorldLabel())}</p>
        ${D?"<p class='body-md muted' style='margin-top:var(--space-xs)'>Loading vault registry\u2026</p>":`<div class="vault-facet-grid" style="margin-top:var(--space-xs)">${_.map(E=>`<div class="vault-facet-card"><div class="vault-facet-head"><h4>${e.esc(E.domain_label||E.label||E.folder||"")}</h4><span class="badge-pill">${E.file_count??0} files</span></div></div>`).join("")||"<p class='muted'>Select a sub-world or link a repo in Worlds</p>"}</div>`}
        <button type="button" class="button-outline-on-dark button-sm" data-goto="world" style="margin-top:var(--space-sm)">Manage vault</button>
      </section>
      <section class="driver-card">
        <div class="search-row">
          <input type="search" class="text-input-on-dark" id="agents-vault-q" placeholder="Search vault\u2026" value="${e.esc(C)}">
          <button type="button" class="button-primary button-sm" id="agents-vault-search">Search</button>
        </div>
        <pre class="run-result mono" id="agents-vault-results" hidden></pre>
      </section>
    </div>`}function j(){let l=e.state.agentsTab||"runs",m=e.collectAgentRuns();if(l==="runs")return e.renderAgentRunsTable(m);if(l==="live"){let _=e.state.live||{};return e.renderLivePanel(_,"agents-tab-live")}return l==="tools"?e.renderAgentsToolsPanel():l==="crm"?e.renderAgentsCrmPanel():l==="vault"?e.renderAgentsVaultPanel():""}function U(){let l=e.state._agents||{},m=e.state.live||l.live||{},_=e.routingMeta(l),C=e.routingLabel(l),D=e.isDirectSpecialist(),E=e.state._delegateDraft||"",G=e.collectAgentRuns(),q=(e.state.approvals||[]).length,te=(l.specialists||[]).filter(ne=>e.agentBusy(m,ne.id)).length,Z=l.skills||[],ae=e.state.agentsTab||"runs",x=!!(e.state._delegateResult||"").trim(),re=e.state._agentActions||[];return`<div class="agents-console">
      <header class="console-toolbar driver-card">
        <div class="console-kpis">
          <div class="console-kpi"><span class="console-kpi__val">${l.specialists?.length||5}</span><span class="console-kpi__lbl">Specialists</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${te||"0"}</span><span class="console-kpi__lbl">Active</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${G.length}</span><span class="console-kpi__lbl">Runs</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${l.total_tools||0}</span><span class="console-kpi__lbl">Tools</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${q}</span><span class="console-kpi__lbl">Approvals</span></div>
        </div>
        <div class="console-toolbar__actions">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          ${Z.map(ne=>`<span class="skill-chip${ne.installed?"":" is-missing"}">${e.esc(ne.name)}</span>`).join("")}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="approvals"${q?"":" disabled"}>Approvals${q?` (${q})`:""}</button>
        </div>
      </header>
  
      ${e.renderSupervisorBanner(l,m)}
  
      <section class="agent-picker-bar driver-card">
        <div class="agent-picker-bar__head">
          <div>
            <p class="caption-uppercase">Specialist routing</p>
            <p class="world-meta">Supervisor is always on \u2014 pick <strong>Auto</strong> or a specialist for direct tasks</p>
          </div>
          <label class="world-select-wrap agent-picker-bar__select">
            <span class="caption-uppercase">Dropdown</span>
            <select id="specialist-select-agents" class="world-select agent-select" aria-label="Specialist override"></select>
          </label>
          <span class="badge-pill agent-routing-badge">${e.esc(C)}</span>
        </div>
        <div class="agent-picker-bar__cards">${e.renderAgentCards(l,m,!0)}</div>
      </section>
  
      <div class="agents-workspace">
        <section class="task-composer driver-card">
          <div class="task-composer__head">
            <div class="agent-card-title-row">
              ${e.agentAvatar(D?_.id:"supervisor",D?_.role:"aggregator")}
              <div>
                <h2 class="title-md">${D?e.esc(_.label):"Supervisor"}</h2>
                <p class="world-meta">${D?e.esc((_.brief||"").slice(0,100)):"Auto-route \u2014 supervisor will delegate to the best specialist"}</p>
              </div>
            </div>
            <span class="agent-status ${e.agentBusy(m,D?_.id:"supervisor")?"busy":"ready"}">${e.esc(C)}</span>
          </div>
          <textarea class="text-input-on-dark task-composer__input" id="delegate-selected" rows="3" placeholder="${D?`Task for ${e.esc(_.label)}\u2026`:"Message supervisor\u2026"}">${e.esc(E)}</textarea>
          <div class="task-composer__foot">
            <button type="button" class="button-primary" id="delegate-selected-btn">${D?`Run ${e.esc(_.label)}`:"Send to supervisor"}</button>
            <span class="world-meta mono" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          </div>
          ${x?`<div class="delegate-result-wrap msg-read-more-host driver-card" data-msg-scope="agents-delegate" data-msg-index="0">
            <div class="msg-md delegate-result-body">${window.FOSMarkdown?.render?.(e.state._delegateResult||"")||e.esc(e.state._delegateResult||"")}</div>
            <button type="button" class="msg-read-more" hidden>Read more</button>
          </div>`:""}
          <section class="driver-card chat-runtime-panel agents-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-agents" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </section>
  
        <aside class="agents-rail driver-card">
          ${e.renderLivePanel(m,"agents-live-panel")}
          <p class="caption-uppercase" style="margin-top:var(--space-sm)">Recent actions</p>
          <div class="action-feed">${re.slice(0,8).map(ne=>`<div class="action-feed__item"><span class="mono">${e.esc(ne.tool_name)}</span><span class="muted">${e.esc((ne.created_at||"").slice(11,16))}</span></div>`).join("")||"<p class='muted'>No actions yet</p>"}</div>
        </aside>
      </div>
  
      <section class="driver-card agents-panel">
        <div class="workspace-tabs">
          <button type="button" class="workspace-tab${ae==="runs"?" is-active":""}" data-agents-tab="runs">Run history</button>
          <button type="button" class="workspace-tab${ae==="live"?" is-active":""}" data-agents-tab="live">Live runtime</button>
          <button type="button" class="workspace-tab${ae==="tools"?" is-active":""}" data-agents-tab="tools">Tools</button>
          <button type="button" class="workspace-tab${ae==="crm"?" is-active":""}" data-agents-tab="crm">CRM</button>
          <button type="button" class="workspace-tab${ae==="vault"?" is-active":""}" data-agents-tab="vault">Vault</button>
        </div>
        <div class="agents-tab-body">${e.renderAgentsTabPanel()}</div>
      </section>
    </div>`}function Q(){if(e.currentView!=="agents"||e.state.agentsTab!=="vault")return;let l=document.querySelector(".agents-console .console-split");l&&(l.outerHTML=e.renderAgentsVaultPanel())}function se(l){let m=l||"";e.state.selectedSpecialist=m,localStorage.setItem("fos_selected_specialist",m),e.populateSpecialistSelect(),e.render()}async function H(){let l=e.$("#agents-vault-q")?.value?.trim();e.state._agentsVaultQ=l;let m=e.$("#agents-vault-results"),_=e.currentWorldId();if(!(!l||!_||_==="root"))try{let D=((await e.api(`/vault/search?${new URLSearchParams({q:l,world_id:_})}`)).hits||[]).map(E=>`[${E.metadata?.domain||"?"}] ${E.metadata?.source||""}
${(E.text||"").slice(0,240)}`).join(`

---

`)||"No hits.";m&&(m.textContent=D,m.hidden=!1)}catch(C){m&&(m.textContent=C.message,m.hidden=!1)}}async function k(){let l=e.currentSpecialistId(),m=e.$("#delegate-selected"),_=(m?.value||"").trim();if(!_)return;let C=e.$("#delegate-selected-btn"),D=e.routingMeta(e.state._agents||{}),E=!!l,G=Date.now();C&&(C.disabled=!0,C.textContent="Running\u2026"),e.startLivePoll(),e.state.agentsTab="live",localStorage.setItem("fos_agents_tab","live"),e.state._delegateResult="Agent working\u2026",e.render();try{let q=await e.api("/chat/async",{method:"POST",body:JSON.stringify(e.chatPayload({message:_,specialist:E?l:void 0})),timeoutMs:2e4}),te=await e.pollAgentJob(q.job.id),Z=te?.job,ae=Z?.result||Z?.error||"(no response)";e.state._delegateResult=ae,e.state._delegateDraft="",m&&(m.value=""),Z?.session_id&&e.setChatSessionId(Z.session_id),e.persistAgentRun({id:Z?.run_id||`local-${G}`,agent:E?l:"supervisor",task:_,result:ae,duration_s:Z?.elapsed_s||Math.round((Date.now()-G)/1e3),ts:Math.floor(G/1e3),tools:(Z?.events||[]).filter(x=>x.name).map(x=>x.name),source:"delegate",artifacts:Z?.artifacts}),e.state.agentsTab="runs",localStorage.setItem("fos_agents_tab","runs"),e.state.expandedRunId=Z?.run_id||`local-${G}`,te?.pending_approvals&&(e.state.approvals=te.pending_approvals,e.updateBadges())}catch(q){e.state._delegateResult="Error: "+q.message}C&&(C.disabled=!1,C.textContent=E?`Run ${D.label}`:"Send to supervisor");try{let q=await e.api("/agents/runs");e.state._agentRunsApi=q.runs||[],e.state._agentActions=q.actions||[]}catch{}e.state._activeJob=null,e.pollLive(),e.render(),e.drawGraphs()}e.supervisorMeta=$,e.listSpecialists=S,e.populateSpecialistSelect=b,e.routingLabel=s,e.routingMeta=g,e.agentBusy=p,e.agentRoleBadge=h,e.agentAvatar=r,e.lastRunForAgent=a,e.collectAgentRuns=n,e.persistAgentRun=u,e.renderFleetAutoCard=i,e.renderSupervisorBanner=f,e.renderFleetCard=O,e.renderAgentCards=I,e.renderFleetCardInner=y,e.renderAgentRunsTable=w,e.renderAgentsToolsPanel=A,e.renderAgentsCrmPanel=L,e.renderAgentsVaultPanel=M,e.renderAgentsTabPanel=j,e.renderAgents=U,e.patchAgentsVaultPanel=Q,e.selectSpecialist=se,e.agentsVaultSearch=H,e.delegateAgent=k}function Oe(e){function $(t){let o=e.state.worlds||e.state._worldFull?.worlds||{},d=o.root,c=o.children||[],v=t||"",T=`<option value="root"${v==="root"||!v?" selected":""}>${e.esc(d?.name||"Main world")}</option>`;return T+=c.map(R=>`<option value="${e.esc(R.id)}"${v===R.id?" selected":""}>${e.esc(R.name)} \xB7 ${e.esc(R.kind||"project")}</option>`).join(""),T}function S(t,o){let d=t?.facets||t?.folders||[],c=[];for(let v of d)for(let T of v.documents||[])T.github_repo===o&&c.push(T);return c.sort((v,T)=>(v.github_path||v.filename||"").localeCompare(T.github_path||T.filename||""))}function b(t){let o=t.filter(d=>{let c=d.github_path||d.filename||"";return/^readme\.md$/i.test(c.split("/").pop()||"")});return o.length?o.sort((d,c)=>(d.github_path||d.filename||"").length-(c.github_path||c.filename||"").length)[0]:null}function s(t){let o=(t.files||[]).length;for(let d of Object.keys(t.dirs||{}))o+=e.countGithubTreeFiles(t.dirs[d]);return o}function g(t,o,d=0){let c=Object.keys(t.dirs||{}).sort(),v=(t.files||[]).sort((R,V)=>R._fileName.localeCompare(V._fileName)),T="";for(let R of c){let V=t.dirs[R],N=e.countGithubTreeFiles(V);T+=`<details class="github-tree-dir"${d<2?" open":""}>
        <summary><span class="mono">${e.esc(R)}</span> <span class="muted">${N} file${N!==1?"s":""}</span></summary>
        <div class="github-tree">${e.renderGithubTreeNode(V,o,d+1)}</div>
      </details>`}for(let R of v){let V=R.github_path||R.filename||R.title,N=/^readme\.md$/i.test((V||"").split("/").pop()||"");T+=`<div class="github-tree-file">
        <span class="github-tree-file__path mono${N?" is-readme":""}">${e.esc(V)}</span>
        <span class="github-tree-file__actions">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-view-doc="${R.id}" data-world-id="${e.esc(o)}" data-doc-title="${e.esc(R.title||V)}">View</button>
          <button type="button" class="button-primary button-sm" data-tag-vault-doc="${R.id}" data-world-id="${e.esc(o)}" data-doc-title="${e.esc(R.title||V)}" data-doc-path="${e.esc(V)}">Tag in agent</button>
        </span>
      </div>`}return T}function p(t,o,d,c){e.state._chatAttachments||(e.state._chatAttachments=[]);let v=Number(t);e.state._chatAttachments.some(T=>T.doc_id===v)||e.state._chatAttachments.push({type:"vault",doc_id:v,title:d||c||"Document",path:c||"",world_id:o}),e.goView("chat")}function h(t,o){if(t?.nodes&&t?.edges)return t;let d=t?.vault||t||{},c=o||{},v=[],T=[],R=c.id||d.world_id||"world",V=`vault-world:${R}`;return v.push({data:{id:V,label:(c.name||"World").slice(0,36),type:"world_root",world_id:R}}),(d.facets||d.folders||[]).forEach(P=>{let z=P.id||P.folder||"slot",W=`vault-facet:${R}:${z}`,X=`${P.label||P.folder||"Folder"} (${P.file_count||0})`;v.push({data:{id:W,label:X.slice(0,40),type:"vault_facet",facet_id:z,folder:P.folder}}),T.push({data:{source:V,target:W,label:"folder"}}),(P.documents||[]).slice(0,14).forEach((K,J)=>{let ee=`vault-doc:${K.id||J}`;v.push({data:{id:ee,label:(K.title||K.filename||"Document").slice(0,36),type:"vault_file",doc_id:K.id,facet_id:z,source:K.source_type||"upload"}}),T.push({data:{source:W,target:ee,label:"doc"}})}),(P.files||[]).slice(0,8).forEach((K,J)=>{let ee=`vault-disk:${R}:${z}:${J}`;v.push({data:{id:ee,label:(K.name||K.relative||"file").slice(0,32),type:"vault_file",path:K.relative,facet_id:z,source:"disk"}}),T.push({data:{source:W,target:ee,label:"disk"}})})}),(d.github_repos||[]).slice(0,10).forEach(P=>{let z=`gh-repo:${P.id}`;v.push({data:{id:z,label:(P.full_name||"repo").split("/").pop().slice(0,28),type:"vault_repo",link_id:P.id,repo:P.full_name}}),T.push({data:{source:V,target:z,label:"github"}})}),v.length<=1&&(v.push({data:{id:"vault-empty",label:"Add docs or link GitHub",type:"empty"}}),T.push({data:{source:V,target:"vault-empty",label:"start"}})),{nodes:v,edges:T}}function r(t){let o=t?.id;if(!o||o==="root")return{nodes:[],edges:[]};if(e.state._vaultLoading&&e.state._vaultWorldId!==o)return{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]};if(e.state._vaultWorldId===o&&e.state._vaultGraph?.nodes?.length)return e.state._vaultGraph;let d=e.vaultReadyFor(o)?e.vaultPayload():null;return d?e.buildVaultGraph(d,t):e.state._vaultLoading?{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]}:{nodes:[{data:{id:"vault-empty",label:"Vault not loaded",type:"empty"}}],edges:[]}}function a(t){return t==="vault"?`
        <span><i style="border-color:#051f13"></i> World</span>
        <span><i style="border-color:#00666b"></i> Folder</span>
        <span><i style="border-color:#8f706b;border-radius:50%"></i> File</span>
        <span><i style="border-color:#f75440;background:#2d312e"></i> GitHub</span>`:`
      <span><i style="border-color:#051f13"></i> Main</span>
      <span><i style="border-color:#f75440"></i> Project</span>
      <span><i style="border-color:#ffb4a8"></i> Idea</span>
      <span><i style="border-color:#00666b"></i> Research</span>
      <span><i style="border-color:#f75440;background:#f7544033"></i> Active</span>`}function n(t="world-create-form"){return`
      <form class="world-form human-form" id="${e.esc(t)}">
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Name</span>
            <input class="text-input-on-dark" name="name" placeholder="e.g. Stamped Energy" required></label>
          <label class="human-field"><span class="caption-uppercase">Category</span>
            <select class="text-input-on-dark" name="kind" id="world-create-kind">
              <option value="project">Startup / venture</option>
              <option value="technical">Technical project</option>
              <option value="idea">Idea / exploration</option>
              <option value="research">Technical research</option>
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Knowledge template</span>
            <select class="text-input-on-dark" name="template">
              <option value="startup">Startup \u2014 ICP, GTM, product, leads\u2026</option>
              <option value="technical">Technical \u2014 architecture, stack, ADRs\u2026</option>
              <option value="idea">Idea \u2014 hypothesis, research, next steps</option>
              <option value="research">Research \u2014 papers, synthesis, industry</option>
            </select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description</span>
          <input class="text-input-on-dark" name="description" placeholder="One-line summary"></label>
        <label class="human-field"><span class="caption-uppercase">Context for agents</span>
          <textarea class="text-input-on-dark" name="context" rows="3" placeholder="What should agents know when this world is active?"></textarea></label>
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Local docs path</span>
            <input class="text-input-on-dark" name="repo_path" placeholder="Optional: C:\\docs\\my-project"></label>
          <label class="human-field"><span class="caption-uppercase">GitHub repo</span>
            <input class="text-input-on-dark" name="github_repo" placeholder="Optional: owner/repo"></label>
        </div>
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm">Create world</button>
          <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="worldCreateOpen">Cancel</button>
        </div>
      </form>`}function u(t){let o=e.worldTreeData(),d=t||"root";return d==="root"||d===o.root?.id?o.root||null:(o.children||[]).find(c=>c.id===d)||null}function i(){return e.state.inspectorWorldId||e.currentWorldId()||"root"}async function f(t,{force:o=!1}={}){if(!t||t==="root"){e.clearVaultScopedState(),e.invalidateGraphCache("graph-world");return}if(!o&&e.vaultReadyFor(t))return;let d=++e.vaultLoadGen;e.state._vaultLoading=!0,e.state._vaultWorldId=t,e.currentView==="world"&&e.patchWorldPanels();try{let c=await e.api(`/worlds/${encodeURIComponent(t)}/vault`);if(d!==e.vaultLoadGen)return;e.state._worldVault=c.vault||null,e.state._vaultGraph=c.vault_graph||null,e.state._vaultWorldId=t,e.invalidateGraphCache("graph-world")}catch{if(d!==e.vaultLoadGen)return;e.clearVaultScopedState()}finally{d===e.vaultLoadGen&&(e.state._vaultLoading=!1)}}async function O(t,o={}){if(!t||t==="root"){e.clearVaultScopedState();return}o.force&&(e.state._vaultWorldId=null),await e.loadWorldVault(t,{force:!0})}async function I(){try{let t=await e.api("/graph/world");e.state._worldFull=t,e.state._worldGraph=t?.graph??null,e.state._worldHierarchyGraph=t?.hierarchy_graph??null,e.state._worldPreviews=t?.world_previews??{},t?.worlds&&(e.state.worlds=t.worlds),e.populateWorldSelect(),e.invalidateGraphCache("graph-world")}catch(t){console.warn("world tree reload failed:",t)}}async function y(t,o={}){if(!t||t==="root"){e.clearVaultScopedState();return}!o.force&&e.vaultReadyFor(t)||await e.loadWorldVault(t,{force:!!o.force})}function w(){let t=e.inspectorWorldId(),o=e.state.activeWorldId||"root";e.$$("[data-inspect-world]").forEach(c=>{let v=c.dataset.inspectWorld;c.classList.toggle("is-inspect",v===t),c.classList.toggle("is-active",v===o)});let d=document.querySelector(".worlds-stat [data-active-world-label]");d&&(d.textContent=e.activeWorldLabel())}function A(){if(e.currentView!=="world")return;let t=e.inspectorWorldId(),o=e.worldById(t),d=e.state._worldFull?.snapshot||e.state.snapshot||{},c=document.getElementById("world-inspector");c&&(c.innerHTML=e.renderWorldInspector(o,d));let v=document.getElementById("world-vault-mount");if(e.isRootWorld(o))v&&(v.innerHTML="");else{let T=e.renderWorldVaultPanel(o);v&&(v.innerHTML=T)}e.patchWorldTreeNav(),e.drawGraphs()}async function L(t={}){let o=e.currentWorldId(),d=e.inspectorWorldId(),c=t.vaultWorldId||(e.currentView==="world"?d:o);!c||c==="root"?e.clearVaultScopedState():await e.ensureVaultForWorld(c,{force:!!t.forceVault}),e.currentView==="world"&&t.reloadTree?await e.reloadWorldTree():(e.currentView==="world"||e.currentView==="dashboard")&&await e.loadGraphData(),e.drawGraphs()}function M(t){let o=t||"root";e.inspectorWorldId()===o&&e.vaultReadyFor(o)&&!e.state._vaultLoading||(e.state.inspectorWorldId=o,e.currentView==="world"&&(e.state._motionSkipOnce=!0,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.patchWorldPanels(),e.reloadVault(o,{force:!0}).then(()=>{e.patchWorldPanels(),FOSMotion?.flashElement?.(e.$("#world-inspector")),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())}).catch(console.error)))}function j(t,o,d,c){let v=t?.id||"root",T=`
      <button type="button" class="world-tree-item is-root${d===v?" is-inspect":""}${c===v?" is-active":""}"
        data-inspect-world="${e.esc(v)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(t?.name||"Main world")}</span>
          <span class="sub">Top-level \xB7 all ventures</span>
        </span>
      </button>`,R=o.map(V=>`
      <button type="button" class="world-tree-item kind-${e.esc(V.kind||"project")}${d===V.id?" is-inspect":""}${c===V.id?" is-active":""}"
        data-inspect-world="${e.esc(V.id)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(V.name)}</span>
          <span class="sub">${e.esc(V.kind||"project")} \xB7 ${e.esc((V.description||"No description").slice(0,42))}</span>
        </span>
      </button>`).join("");return`
      <nav class="world-tree-nav" aria-label="World hierarchy">
        ${T}
        ${o.length?`<div class="world-tree-children">${R}</div>`:""}
      </nav>`}function U(t,o){if(!t)return'<p class="body-md muted">Select a world to inspect its context.</p>';let d=t.id||"root",c=d==="root",v=c?"root":t.kind||"project",T=e.currentWorldId(),V=(e.state._worldPreviews||e.state._worldFull?.world_previews||{})[d]||"",N=o?.crm||{},P=o?.finance||{};if(e.state.worldEditing===d)return`
        <form class="world-edit-form" id="world-edit-form" data-world-id="${e.esc(d)}">
          <div class="world-inspector-title">
            <h2>Edit ${e.esc(t.name)}</h2>
            ${e.worldKindBadge(v)}
          </div>
          ${c?`
            <label>Name<input class="text-input-on-dark" name="name" value="${e.esc(t.name||"")}"></label>`:`
            <label>Name<input class="text-input-on-dark" name="name" value="${e.esc(t.name||"")}" required></label>
            <label>Category
              <select class="text-input-on-dark" name="kind" id="world-edit-kind">
                <option value="project"${t.kind==="project"?" selected":""}>Startup / venture</option>
                <option value="idea"${t.kind==="idea"?" selected":""}>Idea</option>
                <option value="research"${t.kind==="research"?" selected":""}>Technical research</option>
                <option value="technical"${t.kind==="technical"?" selected":""}>Technical project</option>
              </select>
            </label>
            <label>Knowledge template
              <select class="text-input-on-dark" name="template" id="world-edit-template">
                ${(e.state._worldTemplates||[]).map(J=>`<option value="${e.esc(J.id)}"${(t.template||"")===J.id?" selected":""}>${e.esc(J.label)}</option>`).join("")||`<option value="startup"${(t.template||"startup")==="startup"?" selected":""}>Startup / venture</option>`}
              </select>
            </label>`}
          <label>Description<textarea class="text-input-on-dark" name="description" rows="2">${e.esc(t.description||"")}</textarea></label>
          <label>Agent context<textarea class="text-input-on-dark" name="context" rows="5">${e.esc(t.context||"")}</textarea></label>
          <div class="world-inspector-actions">
            <button type="submit" class="button-primary button-sm">Save</button>
            <button type="button" class="button-tertiary-text button-sm" data-cancel-edit>Cancel</button>
          </div>
        </form>`;let W=c?[["Contacts",N.total_contacts||0],["Follow-ups",N.followups_due||0],["Open tasks",o?.tasks_open||0],["Approvals",o?.approvals_pending||0]]:[];c&&P?.set&&W.push(["Runway",P.runway_months!=null?`${P.runway_months} mo`:"\u2014"]);let X=c?e.worldTreeData().children||[]:[],K=(o?.goals_active||[]).slice(0,5);return`
      <div class="world-inspector-title">
        <div>
          <h2>${e.esc(t.name)}</h2>
          <p class="world-meta">id: ${e.esc(d)}${t.updated_at?` \xB7 updated ${e.esc(t.updated_at)}`:""}</p>
        </div>
        ${e.worldKindBadge(v)}
      </div>
      ${T===d?'<p class="world-meta" style="color:var(--color-primary)">\u25CF Active for chat &amp; agents</p>':'<p class="world-meta">Not active \u2014 switch from the top bar or below</p>'}
      <div class="world-inspector-section">
        <h4>Description</h4>
        <p>${e.esc(t.description||"No description yet.")}</p>
      </div>
      <div class="world-inspector-section">
        <h4>Agent context</h4>
        <p>${e.esc(t.context||"No focused context \u2014 add what the agent should know in this world.")}</p>
      </div>
      ${W.length?`
        <div class="world-inspector-section">
          <h4>Global snapshot</h4>
          <div class="world-inspector-facts">${W.map(([J,ee])=>`<div class="world-inspector-fact"><span class="k">${e.esc(J)}</span><span class="v">${e.esc(String(ee))}</span></div>`).join("")}</div>
        </div>`:""}
      ${c&&X.length?`
        <div class="world-inspector-section">
          <h4>Sub-worlds indexed (${X.length})</h4>
          <div class="world-inspector-facts">${X.map(J=>`<div class="world-inspector-fact"><span class="k">${e.esc(J.name)}</span><span class="v">${e.esc(J.kind||"project")}</span></div>`).join("")}</div>
        </div>`:""}
      ${c?"":`
        <div class="world-inspector-section">
          <h4>Template</h4>
          <p class="body-md">${e.esc(t.template||v)} \u2014 facet folders on disk under <code class="mono">data/knowledge/</code></p>
          ${t.github_repo?`<p class="world-meta">GitHub: ${e.esc(t.github_repo)}</p>`:""}
          ${t.repo_path?`<p class="world-meta">Repo: ${e.esc(t.repo_path)}</p>`:""}
        </div>`}
      ${!c&&e.worldTreeData().root?`
        <div class="world-inspector-section">
          <h4>Parent</h4>
          <p class="body-md">${e.esc(e.worldTreeData().root.name)} <span class="world-meta">(main world)</span></p>
        </div>`:""}
      ${K.length&&c?`
        <div class="world-inspector-section">
          <h4>Active goals</h4>
          <p class="body-md">${K.map(J=>e.esc(typeof J=="string"?J:J.title||J)).join(" \xB7 ")}</p>
        </div>`:""}
      <div class="world-inspector-section">
        <h4>What the agent sees</h4>
        <pre class="world-context-preview">${e.esc(V||"Preview loads when graph data is fetched\u2026")}</pre>
      </div>
      <div class="world-inspector-actions">
        <button type="button" class="button-primary button-sm" data-use-world="${e.esc(d)}">Use in chat</button>
        <button type="button" class="button-outline-on-dark button-sm" data-set-active-world="${e.esc(d)}">Set active</button>
        <button type="button" class="button-tertiary-text button-sm" data-edit-world="${e.esc(d)}">Edit</button>
        ${c?"":`<button type="button" class="button-tertiary-text button-sm" data-delete-world="${e.esc(d)}">Delete</button>`}
      </div>`}function Q(t,o,d){let c=e.state.ui?.vaultDocEdit,v=d||o[0]?.id||o[0]?.folder||"docs",T=o.find(P=>(P.id||P.folder)===v)||o[0]||{label:v,id:v},R=c&&c.title||"",V=c&&c.description||"",N=c?.id||"";return`
      <form class="human-form vault-doc-form" id="vault-doc-form" data-world-id="${e.esc(t.id)}" data-facet-id="${e.esc(v)}">
        ${N?`<input type="hidden" name="doc_id" value="${N}">`:""}
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Category slot</span>
            <select class="text-input-on-dark" name="facet_id" id="vault-doc-facet">
              ${o.map(P=>{let z=P.id||P.folder;return`<option value="${e.esc(z)}"${z===v?" selected":""}>${e.esc(P.label)}</option>`}).join("")}
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Title</span>
            <input class="text-input-on-dark" name="title" required placeholder="e.g. Current ICP" value="${e.esc(R)}"></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description (indexed for search)</span>
          <textarea class="text-input-on-dark" name="description" rows="3" placeholder="Short summary agents use to find this doc. Full content goes to ${e.esc(e.vaultStorageLabel())}.">${e.esc(V)}</textarea></label>
        ${N?`
        <label class="human-field"><span class="caption-uppercase">Document body (markdown)</span>
          <textarea class="text-input-on-dark" name="content" id="vault-doc-content" rows="8" placeholder="Loading\u2026"></textarea></label>`:`
        <label class="human-field"><span class="caption-uppercase">Upload file</span>
          <input type="file" name="file" accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json"></label>
        <label class="human-field"><span class="caption-uppercase">Or paste markdown</span>
          <textarea class="text-input-on-dark" name="content" rows="6" placeholder="# ICP

Target: \u2026"></textarea></label>`}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm">${N?"Update document":"Add document"}</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-cancel-doc>Cancel</button>
        </div>
        <p class="world-meta">Slot: <strong>${e.esc(T.label)}</strong> \xB7 Full files in ${e.esc(e.vaultStorageLabel())}; only title + description in vector index.</p>
      </form>`}function se(t,o){let d=e.state._githubStatus||{},c=!!d.connected,v=!!d.oauth_configured,T=o.github_repos||[],V=(e.state._githubRepos||[]).map(P=>`<option value="${e.esc(P.full_name)}">${e.esc(P.full_name)}${P.private?" (private)":""}</option>`).join(""),N=T.map(P=>{let z=e.isLinkSyncing(P.id),W=e.githubRepoDocuments(o,P.full_name),X=e.findReadmeDoc(W),K=W.filter(ee=>e.isMarkdownFilename(ee.github_path||ee.filename)),J=K.length?`<div class="github-tree github-tree--repo">${e.renderGithubTreeNode(e.buildGithubPathTree(K),t.id)}</div>`:"";return`
      <div class="github-repo-row">
        <div>
          <strong class="mono">${e.esc(P.full_name)}</strong>
          ${z?'<span class="sync-badge">Syncing</span>':""}
          <span class="world-meta">${P.file_count||W.length||0} files synced${P.synced_at?` \xB7 ${e.esc(P.synced_at)}`:""}</span>
          ${P.last_error?`<span class="world-meta" style="color:var(--color-warn)">${e.esc(P.last_error)}</span>`:""}
        </div>
        <div class="github-repo-row__actions">
          <button type="button" class="button-primary button-sm" data-vault-view-doc="${X?.id||""}" data-world-id="${e.esc(t.id)}" data-doc-title="${e.esc(X?.title||`${P.full_name} README`)}"${!X||z?" disabled":""}>Open README</button>
          <button type="button" class="button-outline-on-dark button-sm${z?" is-busy":""}" data-github-sync="${P.id}" data-world-id="${e.esc(t.id)}"${z?" disabled":""}>${z?"Syncing\u2026":`Sync to ${e.esc(e.vaultStorageLabel())}`}</button>
          <button type="button" class="button-tertiary-text button-sm" data-github-unlink="${P.id}" data-world-id="${e.esc(t.id)}"${z?" disabled":""}>Unlink</button>
        </div>
        ${W.length?`<details class="github-repo-files" open>
          <summary class="caption-uppercase">Repo structure \xB7 ${K.length} markdown file${K.length===1?"":"s"}</summary>
          ${J||"<p class='muted body-md'>No markdown files synced yet.</p>"}
        </details>`:'<p class="body-md muted github-repo-files-empty">No files synced yet \u2014 link and sync to browse the repo tree here.</p>'}
      </div>`}).join("");return v?c?`<section class="github-repos-panel">
      <div class="github-repos-panel__head">
        <div>
          <p class="section-eyebrow">GitHub repositories</p>
          <p class="body-md muted">Connected as <strong>${e.esc(d.user?.login||"GitHub")}</strong> \u2014 link multiple repos; files sync to ${e.esc(e.vaultStorageLabel())} with searchable descriptions.</p>
        </div>
      </div>
      <div class="human-form__row" style="align-items:flex-end">
        <label class="human-field" style="flex:1">
          <span class="caption-uppercase">Add repository</span>
          <select class="text-input-on-dark" id="github-repo-pick">
            <option value="">Select a repository\u2026</option>
            ${V}
          </select>
        </label>
        <button type="button" class="button-primary button-sm" data-github-add="${e.esc(t.id)}"${e.state._syncingLinkIds.size?" disabled":""}>Link &amp; sync</button>
      </div>
      <div class="github-repo-list">${N||"<p class='body-md muted'>No GitHub repos linked yet.</p>"}</div>
    </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub repositories</p>
        <p class="body-md muted">Authorize GitHub to browse your repos and sync docs into this world's knowledge graph (${e.esc(e.vaultStorageLabel())}).</p>
        <a class="button-primary button-sm" href="/api/github/auth/start?world_id=${encodeURIComponent(t.id)}">Connect GitHub</a>
      </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub</p>
        <p class="body-md muted">Add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to <code>.env</code>, register callback <code>${e.esc(d.redirect_uri||"/api/github/callback")}</code>, then restart.</p>
      </section>`}function H(t,o){let d=t.facets||t.folders||[],c=t.storage_backend||(e.vaultStorageLabel()==="S3"?"s3":"local");return`
      <div class="vault-registry-bar" role="status" aria-live="polite">
        <span class="vault-registry-chip"><span class="k">Template</span> ${e.esc(t.template_id||o.template||"startup")}</span>
        <span class="vault-registry-chip"><span class="k">Slots</span> ${d.length}</span>
        <span class="vault-registry-chip"><span class="k">Docs</span> ${t.document_count||0}</span>
        <span class="vault-registry-chip"><span class="k">Storage</span> ${e.esc(c)}</span>
        <button type="button" class="button-tertiary-text button-sm" data-vault-reload="${e.esc(o.id)}">Reload registry</button>
      </div>`}function k(t){if(!t||t.id==="root")return"";if(e.state._vaultLoading||e.state._vaultWorldId!==t.id)return`
      <section class="driver-card vault-panel knowledge-panel panel-loading" style="margin-top:var(--space-md)">
        <p class="section-eyebrow">Knowledge vault</p>
        <h3 class="title-sm">${e.esc(t.name)}</h3>
        <div class="skeleton-grid" style="margin-top:var(--space-sm)">
          ${e.skeletonCard(3)}${e.skeletonCard(3)}${e.skeletonCard(3)}
        </div>
      </section>`;let o=e.vaultPayload()||{},d=o.facets||o.folders||[],c=o.domain_counts||{},v=e.state.ui?.vaultFacet||d[0]?.id||d[0]?.folder||null,T=e.state.ui?.vaultDocForm||e.state.ui?.vaultDocEdit,R=(d.find(W=>(W.id||W.folder)===v)||{}).documents||[],V=d.map(W=>{let X=W.id||W.folder,K=(W.documents||[]).length+(W.files||[]).length;return`<button type="button" class="vault-facet-tab${X===v?" is-active":""}" data-vault-facet="${e.esc(X)}">${e.esc(W.label)} <span class="badge-pill">${K}</span></button>`}).join(""),N=R.map(W=>{let X=W.github_path?` \xB7 ${W.github_path}`:"",K=e.isMarkdownFilename(W.filename||W.github_path);return`
      <article class="vault-doc-card" data-doc-id="${W.id}">
        <div class="vault-doc-card__head">
          <h4>${e.esc(W.title)}</h4>
          <span class="world-meta">${e.esc(W.filename||"")}${e.esc(X)} \xB7 ${e.formatBytes(W.size_bytes)}${W.source_type==="github"?" \xB7 GitHub":""}</span>
        </div>
        <p class="body-md">${e.esc(W.description||"No description")}</p>
        <div class="vault-doc-card__actions">
          ${K?`<button type="button" class="button-primary button-sm" data-vault-view-doc="${W.id}" data-world-id="${e.esc(t.id)}" data-doc-title="${e.esc(W.title)}">View</button>`:""}
          <button type="button" class="button-outline-on-dark button-sm" data-tag-vault-doc="${W.id}" data-world-id="${e.esc(t.id)}" data-doc-title="${e.esc(W.title)}" data-doc-path="${e.esc(W.github_path||W.filename||"")}">Tag in agent</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-edit-doc="${W.id}">Edit</button>
          <button type="button" class="button-tertiary-text button-sm" data-vault-delete-doc="${W.id}">Remove</button>
        </div>
      </article>`}).join(""),P=(d.find(W=>(W.id||W.folder)===v)||{}).files||[],z=P.length?`<ul class="vault-file-list">${P.map(W=>`<li class="mono">${e.esc(W.relative||W.name)} <span class="muted">on disk</span></li>`).join("")}</ul>`:"";return`
      <section class="driver-card vault-panel knowledge-panel" style="margin-top:var(--space-md)">
        <div class="vault-panel-head">
          <div>
            <p class="section-eyebrow">Knowledge graph</p>
            <h3 class="title-sm">${e.esc(t.name)} \u2014 ${e.esc(o.template_id||t.template||"startup")} template</h3>
            <p class="body-md muted">Category slots for this world type. Add docs with a searchable description; large files live in ${e.esc(e.vaultStorageLabel())}. Open the <strong>Files</strong> tab in the map above for the folder graph.</p>
            <p class="world-meta">${o.document_count||0} registered docs \xB7 ${e.esc(o.vault_path||"")}${o.repo_path?` \xB7 repo: ${e.esc(o.repo_path)}`:""}</p>
          </div>
          <div class="vault-panel-actions">
            <button type="button" class="button-primary button-sm" data-vault-add-doc="${e.esc(t.id)}">Add document</button>
            <button type="button" class="button-outline-on-dark button-sm" data-world-graph-tab="vault">Open file map</button>
            <input class="text-input-on-dark" id="vault-repo-path" placeholder="Local repo path" value="${e.esc(t.repo_path||"")}">
            <button type="button" class="button-outline-on-dark button-sm" data-vault-link="${e.esc(t.id)}">Link repo</button>
            <button type="button" class="button-outline-on-dark button-sm" data-vault-ingest="${e.esc(t.id)}">Re-ingest</button>
          </div>
        </div>
        ${e.renderGithubReposPanel(t,o)}
        ${e.renderVaultRegistryBar(o,t)}
        <div class="vault-facet-tabs" role="tablist">${V||"<span class='muted'>No categories</span>"}</div>
        ${T?e.renderVaultDocForm(t,d,v):""}
        <div class="vault-doc-grid">${N||"<p class='body-md muted'>No documents in this slot yet \u2014 add your ICP, GTM notes, research, etc.</p>"}</div>
        ${z}
        <div class="vault-search-row">
          <input class="text-input-on-dark" id="vault-search-q" placeholder="Search descriptions in this world\u2026">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-search="${e.esc(t.id)}">Search</button>
        </div>
        <pre class="vault-search-results mono" id="vault-search-results" hidden></pre>
      </section>`}function l(){let t=e.state._worldFull||{},o=t.worlds||e.state.worlds||{},d=o.root||{},c=o.children||[],v=e.inspectorWorldId(),T=e.currentWorldId(),R=e.worldById(v)||d,V=t.snapshot||e.state.snapshot||{},N=e.state.config?.my_name||"You";e.isRootWorld(R)&&e.worldGraphTab==="vault"&&(e.worldGraphTab="hierarchy");let P=!e.isRootWorld(R);return`
      <div class="worlds-page">
        <section class="worlds-hero">
          <div class="worlds-hero-lead">
            <h2>${e.esc(N)}'s world map</h2>
            <p><strong>Your venture map</strong> \u2014 create worlds, set context, link doc repos, and switch active context. You define each world; agents read what you write.</p>
          </div>
          <div class="worlds-stat">
            <span class="n">${c.length+1}</span>
            <span class="l">Worlds</span>
          </div>
          <div class="worlds-stat">
            <span class="n">${c.length}</span>
            <span class="l">Sub-worlds</span>
          </div>
          <div class="worlds-stat">
            <span class="n" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
            <span class="l">Active context</span>
          </div>
        </section>
  
        <div class="worlds-workspace">
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Hierarchy</h3>
            </div>
            <div class="worlds-panel-body">
              ${e.renderWorldTreeNav(d,c,v,T)}
            </div>
          </section>
  
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Map</h3>
              <div class="world-graph-tabs" role="tablist">
                <button type="button" class="world-graph-tab${e.worldGraphTab==="hierarchy"?" is-active":""}" data-world-graph-tab="hierarchy">Hierarchy</button>
                <button type="button" class="world-graph-tab${e.worldGraphTab==="ecosystem"?" is-active":""}" data-world-graph-tab="ecosystem">Ecosystem</button>
                ${P?`<button type="button" class="world-graph-tab${e.worldGraphTab==="vault"?" is-active":""}" data-world-graph-tab="vault">Files</button>`:""}
              </div>
            </div>
            <div id="graph-world" class="graph-canvas world-graph-canvas" role="img" aria-label="World graph"></div>
            <div class="world-graph-legend" id="world-graph-legend">
              ${e.worldGraphLegendHtml(e.worldGraphTab)}
            </div>
          </section>
  
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Inspector</h3>
            </div>
            <div class="worlds-panel-body" id="world-inspector">
              ${e.renderWorldInspector(R,V)}
            </div>
          </section>
        </div>
  
        ${e.isRootWorld(R)?"":`<div id="world-vault-mount">${e.renderWorldVaultPanel(R)}</div>`}
  
        <section class="world-create-panel driver-card${e.state.ui?.worldCreateOpen?" is-open":""}" id="world-create-panel">
          <div class="world-create-panel__head">
            <div>
              <p class="section-eyebrow">You create</p>
              <h3 class="title-sm">New world</h3>
              <p class="body-md muted">Add a venture, project, or idea under your root world. You choose the context \u2014 agents only use what you define.</p>
            </div>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="worldCreateOpen" aria-expanded="${e.state.ui?.worldCreateOpen?"true":"false"}">
              ${e.state.ui?.worldCreateOpen?"Hide form":"Create world"}
            </button>
          </div>
          ${e.state.ui?.worldCreateOpen?e.renderWorldCreateForm("world-create-form"):""}
        </section>
      </div>`}function m(t){return!t||t.id==="root"}async function _(t){let o=new FormData(t),d=(o.get("name")||"").toString().trim();if(d)try{let c=await e.api("/worlds",{method:"POST",body:JSON.stringify({name:d,kind:(o.get("kind")||"project").toString(),template:(o.get("template")||"").toString().trim()||void 0,description:(o.get("description")||"").toString().trim(),context:(o.get("context")||"").toString().trim(),repo_path:(o.get("repo_path")||"").toString().trim(),github_repo:(o.get("github_repo")||"").toString().trim()})});e.state.worlds=c.tree,e.setActiveWorld(c.world?.id),await e.refresh(),e.currentView==="world"&&(await e.reloadWorldTree(),e.selectInspectorWorld(c.world?.id)),t.reset(),e.state.ui&&(e.state.ui.worldCreateOpen=!1)}catch(c){alert(c.message)}}async function C(t){let o=t.dataset.worldId;if(!o)return;let d=new FormData(t),c={name:(d.get("name")||"").toString().trim(),description:(d.get("description")||"").toString(),context:(d.get("context")||"").toString()};if(o!=="root"){c.kind=(d.get("kind")||"project").toString();let v=(d.get("template")||"").toString().trim();v&&(c.template=v)}try{let v=await e.api(`/worlds/${encodeURIComponent(o)}`,{method:"PATCH",body:JSON.stringify(c)});e.state.worlds=v.tree,e.state.worldEditing=null,e.currentView==="world"?(await e.reloadWorldTree(),await e.reloadVault(o,{force:!0}),e.patchWorldPanels()):await e.refresh()}catch(v){alert(v.message)}}async function D(t){let o=t.dataset.worldId,d=(t.querySelector("[name=doc_id]")?.value||"").trim(),c=new FormData(t),v=(c.get("title")||"").toString().trim(),T=(c.get("facet_id")||t.dataset.facetId||"docs").toString(),R=(c.get("description")||"").toString().trim(),V=(c.get("content")||"").toString(),N=t.querySelector('input[type="file"]')?.files?.[0];try{if(d)await e.api(`/worlds/${encodeURIComponent(o)}/vault/documents/${encodeURIComponent(d)}`,{method:"PATCH",body:JSON.stringify({title:v,description:R,facet_id:T,content:V||void 0})});else if(N){let P=new FormData;P.append("file",N),P.append("title",v),P.append("description",R),P.append("facet_id",T),await e.apiUpload(`/worlds/${encodeURIComponent(o)}/vault/documents`,P)}else if(V.trim())await e.api(`/worlds/${encodeURIComponent(o)}/vault/documents`,{method:"POST",body:JSON.stringify({title:v,description:R,facet_id:T,content:V})});else return alert("Upload a file or paste markdown content.");e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),await e.reloadVault(o,{force:!0}),e.afterVaultMutation(o)}catch(P){alert(P.message)}}async function E(t,o){e.state.ui||(e.state.ui={});try{let d=await e.api(`/worlds/${encodeURIComponent(t)}/vault/documents/${encodeURIComponent(o)}/content`);e.state.ui.vaultDocEdit=d.document,e.state.ui.vaultDocForm=!0,e.state.ui.vaultFacet=d.document?.facet_id||e.state.ui.vaultFacet,e.currentView==="world"?e.patchWorldPanels():e.render();let c=e.$("#vault-doc-content");c&&(c.value=d.content||"")}catch(d){alert(d.message)}}async function G(t){let o=e.$("#github-repo-pick")?.value?.trim();if(!o)return alert("Select a repository");let d=document.querySelector(`[data-github-add="${t}"]`);d&&(d.disabled=!0);try{let c=await e.api(`/worlds/${encodeURIComponent(t)}/repos`,{method:"POST",body:JSON.stringify({full_name:o}),timeoutMs:12e4});if(c.job?.status==="failed")throw new Error(c.job.message||"Could not start sync");c.job?.id?await e.runGithubSyncJob(c.job.id,`Syncing ${o}`,{worldId:t,linkId:c.repo?.id}):(await e.reloadVault(t,{force:!0}),e.afterVaultMutation(t))}catch(c){alert(c.message)}finally{d&&(d.disabled=e.state._syncingLinkIds.size>0)}}async function q(t,o){if(!e.isLinkSyncing(o))try{let d=await e.api(`/worlds/${encodeURIComponent(t)}/repos/${encodeURIComponent(o)}/sync`,{method:"POST",body:"{}",timeoutMs:12e4});if(d.job?.status==="failed")throw new Error(d.job.message||"Could not start sync");if(d.job?.id){let c=(e.state._worldVault?.github_repos||[]).find(v=>String(v.id)===String(o))?.full_name||"repository";await e.runGithubSyncJob(d.job.id,`Re-syncing ${c}`,{worldId:t,linkId:o})}}catch(d){alert(d.message)}}async function te(t,o){if(confirm("Unlink this repo and remove its synced documents from this world?"))try{await e.api(`/worlds/${encodeURIComponent(t)}/repos/${encodeURIComponent(o)}`,{method:"DELETE"}),await e.reloadVault(t,{force:!0}),e.afterVaultMutation(t)}catch(d){alert(d.message)}}async function Z(t,o){if(confirm("Remove this document from the knowledge graph?"))try{await e.api(`/worlds/${encodeURIComponent(t)}/vault/documents/${encodeURIComponent(o)}`,{method:"DELETE"}),await e.reloadVault(t,{force:!0}),e.afterVaultMutation(t)}catch(d){alert(d.message)}}async function ae(t){try{let o=await e.api(`/worlds/${encodeURIComponent(t)}/vault/ingest`,{method:"POST",body:"{}"});alert(`Ingested ${o.files||0} files (${o.total_chunks||0} chunks)`),await e.reloadVault(t,{force:!0}),e.afterVaultMutation(t)}catch(o){alert(o.message)}}async function x(t){let o=e.$("#vault-repo-path")?.value?.trim();if(!o)return alert("Enter a local repo path");try{let d=await e.api(`/worlds/${encodeURIComponent(t)}/vault/link-repo`,{method:"POST",body:JSON.stringify({repo_path:o})});if(d.error)return alert(d.error);alert(`Linked and ingested ${d.files||0} files`),await e.reloadVault(t,{force:!0}),await e.refresh(),e.afterVaultMutation(t)}catch(d){alert(d.message)}}async function re(t){let o=e.$("#vault-search-q")?.value?.trim();if(!o)return;let d=e.$("#vault-search-results");try{let v=((await e.api(`/vault/search?${new URLSearchParams({q:o,world_id:t})}`)).hits||[]).map(T=>`[${T.metadata?.domain||"?"}] ${T.metadata?.source||""}
${(T.text||"").slice(0,200)}`).join(`

---

`)||"No hits.";d&&(d.textContent=v,d.hidden=!1)}catch(c){d&&(d.textContent=c.message,d.hidden=!1)}}async function ne(t){if(confirm("Delete this sub-world?"))try{let o=await e.api(`/worlds/${encodeURIComponent(t)}`,{method:"DELETE"});e.state.worlds=o.tree,e.currentWorldId()===t&&e.setActiveWorld("root"),e.inspectorWorldId()===t&&e.selectInspectorWorld("root"),await e.refresh(),e.currentView==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.render())}catch(o){alert(o.message)}}e.renderWorldOptionsForDocs=$,e.githubRepoDocuments=S,e.findReadmeDoc=b,e.countGithubTreeFiles=s,e.renderGithubTreeNode=g,e.tagVaultDocInChat=p,e.buildVaultGraph=h,e.vaultGraphForWorld=r,e.worldGraphLegendHtml=a,e.renderWorldCreateForm=n,e.worldById=u,e.inspectorWorldId=i,e.loadWorldVault=f,e.reloadVault=O,e.reloadWorldTree=I,e.ensureVaultForWorld=y,e.patchWorldTreeNav=w,e.patchWorldPanels=A,e.onWorldContextChanged=L,e.selectInspectorWorld=M,e.renderWorldTreeNav=j,e.renderWorldInspector=U,e.renderVaultDocForm=Q,e.renderGithubReposPanel=se,e.renderVaultRegistryBar=H,e.renderWorldVaultPanel=k,e.renderWorld=l,e.isRootWorld=m,e.createWorldFromForm=_,e.saveWorldEdit=C,e.submitVaultDoc=D,e.startVaultDocEdit=E,e.connectGithubRepo=G,e.syncGithubRepo=q,e.unlinkGithubRepo=te,e.deleteVaultDoc=Z,e.vaultIngest=ae,e.vaultLinkRepo=x,e.vaultSearch=re,e.deleteWorld=ne}function Re(e){function $(){let w=e.state.ui?.crmTab||localStorage.getItem("fos_crm_tab")||"contacts";return w==="outreach"?"contacts":w}function S(w){let A=e.state.worlds||e.state._worldFull?.worlds||{},L=A.root,M=A.children||[],j=[];return L&&j.push(`<option value="${e.esc(L.id||"root")}"${(w||"root")===(L.id||"root")?" selected":""}>${e.esc(L.name||"Main world")}</option>`),M.forEach(U=>{j.push(`<option value="${e.esc(U.id)}"${w===U.id?" selected":""}>${e.esc(U.name||U.id)}</option>`)}),j.join("")}function b(w={}){let A=e.crmTab();return`<nav class="crm-tabs" role="tablist" aria-label="CRM sections">${[["contacts","Contacts",w.contacts],["companies","Companies",w.companies],["pipeline","Pipeline",null]].map(([M,j,U])=>`<button type="button" role="tab" aria-selected="${A===M}" class="crm-tab${A===M?" crm-tab--active":""}" data-crm-tab="${M}">${e.esc(j)}${U!=null?`<span class="crm-tab__count">${U}</span>`:""}</button>`).join("")}</nav>`}function s(){let w=e.state._crm?.contacts||[],A=e.state._crm?.followups_due||[],L=!!e.state.ui?.crmFormOpen,M=e.state._crmCompanies?.companies||[],j=H=>e.CRM_STATUSES.map(k=>`<option value="${k}"${k===H?" selected":""}>${e.esc(k)}</option>`).join(""),U='<option value="">\u2014 None \u2014</option>'+M.map(H=>`<option value="${H.id}">${e.esc(H.name)}</option>`).join(""),Q=w.slice(0,50).map(H=>`<tr>
      <td>${e.esc(H.name)}</td><td>${e.esc(H.company||"\u2014")}</td><td>${e.esc(H.role||"\u2014")}</td>
      <td><select class="text-input-on-dark crm-status-select" data-crm-status="${H.id}" aria-label="Status for ${e.esc(H.name)}">${j(H.status||"prospect")}</select></td>
      <td class="muted">${e.esc(H.email||"")}</td>
      <td class="muted">${e.esc(H.phone||"")}</td>
      <td><label class="human-field--checkbox" style="margin:0">
        <input type="checkbox" data-crm-whatsapp="${H.id}" ${H.whatsapp_enabled?"checked":""} ${H.phone?"":"disabled"} aria-label="Allow WhatsApp for ${e.esc(H.name)}">
      </label></td>
      <td>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${H.id}" data-followup-days="3">3d</button>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${H.id}" data-followup-days="7">7d</button>
        ${H.whatsapp_enabled?`<button type="button" class="button-tertiary-text button-sm" data-crm-wa-thread="${H.id}">WA</button>`:""}
      </td></tr>`).join(""),se=A.map(H=>`<li class="crm-followup-row">
      <span>${e.esc(H.name)} @ ${e.esc(H.company||"?")}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goto="crm">Open</button>
    </li>`).join("")||"<li class='muted'>None due</li>";return`
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Contacts</p>
            <h3 class="title-sm">People &amp; follow-ups</h3>
          </div>
          <button type="button" class="button-primary button-sm" data-toggle-ui="crmFormOpen">${L?"Hide form":"Add contact"}</button>
        </div>
        ${L?`
        <form class="human-form" id="crm-create-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Full name"></label>
            <label class="human-field"><span class="caption-uppercase">Company</span>
              <select class="text-input-on-dark" name="company_id">${U}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Role</span>
              <input class="text-input-on-dark" name="role" placeholder="Title"></label>
            <label class="human-field"><span class="caption-uppercase">Email</span>
              <input class="text-input-on-dark" name="email" type="email" placeholder="email@company.com"></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${j("prospect")}</select></label>
            <label class="human-field"><span class="caption-uppercase">Phone</span>
              <input class="text-input-on-dark" name="phone" placeholder="+44 7911 123456"></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">LinkedIn</span>
              <input class="text-input-on-dark" name="linkedin_url" placeholder="https://linkedin.com/in/\u2026"></label>
            <label class="human-field human-field--checkbox" style="align-self:end">
              <input type="checkbox" name="whatsapp_enabled" value="1">
              <span>Allow WhatsApp (read/write this contact only)</span>
            </label>
          </div>
          <label class="human-field"><span class="caption-uppercase">Notes</span>
            <textarea class="text-input-on-dark" name="notes" rows="2" placeholder="Context for follow-ups"></textarea></label>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save contact</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="crmFormOpen">Cancel</button>
          </div>
        </form>`:""}
      </section>
      <section class="driver-card span-12"><p class="caption-uppercase">Follow-ups due</p><ul class="list-plain" style="margin-top:var(--space-sm)">${se}</ul></section>
      <section class="band-light span-12">
        <p class="caption-uppercase" style="color:var(--color-muted)">Contacts (${w.length})</p>
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Role</th><th>Status</th><th>Email</th><th>Phone</th><th>WA</th><th>Follow up</th></tr></thead>
        <tbody>${Q||'<tr><td colspan="8" class="muted">No contacts yet \u2014 use Add contact above.</td></tr>'}</tbody></table></div>
        ${e.state._crmWaThread?.length?`<div class="driver-card" style="margin-top:var(--space-md)">
          <p class="caption-uppercase">WhatsApp thread</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${e.state._crmWaThread.map(H=>`<li><span class="muted">${e.esc((H.sent_at||"").slice(0,16).replace("T"," "))}</span> <strong>${e.esc(H.direction||"")}</strong>: ${e.esc((H.body||"").slice(0,200))}</li>`).join("")}</ul>
        </div>`:""}
      </section>`}function g(){if(e.state._crmCompaniesLoading)return`<section class="driver-card span-12 crm-loading-panel" aria-busy="true">
        <div class="crm-skeleton crm-skeleton--title"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
      </section>`;if(e.state._crmCompaniesError)return`<section class="driver-card span-12 crm-error-panel">
        <p class="body-md">Could not load companies \u2014 ${e.esc(e.state._crmCompaniesError)}</p>
        <button type="button" class="button-primary button-sm" data-crm-reload>Retry</button>
      </section>`;let w=e.state._crmCompanies?.companies||[],A=e.state._crmCompanies?.meta?.unlinked_contact_companies||0,L=!!e.state.ui?.crmCompanyFormOpen,M=e.state.ui?.crmCompanyDetail,j=e.currentWorldId(),U=l=>e.COMPANY_STATUSES.map(m=>`<option value="${m}"${m===l?" selected":""}>${e.esc(m)}</option>`).join(""),Q=w.map(l=>`<tr>
      <td><button type="button" class="button-tertiary-text" data-crm-company-detail="${l.id}">${e.esc(l.name)}</button></td>
      <td>${e.esc(l.sector||l.industry||"\u2014")}</td>
      <td><span class="crm-status-pill crm-status-pill--${e.esc((l.status||"prospect").replace(/\s+/g,"-"))}">${e.esc(l.status||"prospect")}</span></td>
      <td>${l.contact_count??0}</td>
      <td class="muted">${e.esc((l.last_contacted_at||"").slice(0,10))}</td>
    </tr>`).join(""),se="";if(M){let l=w.find(_=>String(_.id)===String(M))||e.state._crmCompanyDetail?.company,m=e.state._crmCompanyDetail?.contacts||[];l&&(se=`<aside class="crm-company-drawer driver-card">
          <div class="human-panel__head">
            <h4 class="title-sm">${e.esc(l.name)}</h4>
            <button type="button" class="button-outline-on-dark button-sm" data-crm-company-close>Close</button>
          </div>
          <dl class="settings-kv">
            <div class="settings-kv__row"><dt>Sector</dt><dd>${e.esc(l.sector||l.industry||"\u2014")}</dd></div>
            <div class="settings-kv__row"><dt>Status</dt><dd>${e.esc(l.status||"prospect")}</dd></div>
            <div class="settings-kv__row"><dt>Website</dt><dd>${l.website?`<a href="${e.esc(l.website)}" target="_blank" rel="noopener">${e.esc(l.website)}</a>`:"\u2014"}</dd></div>
          </dl>
          ${l.research_summary?`<p class="body-md" style="margin-top:var(--space-sm)">${e.esc(l.research_summary)}</p>`:""}
          ${l.notes?`<p class="muted body-sm">${e.esc(l.notes)}</p>`:""}
          <p class="caption-uppercase" style="margin-top:var(--space-md)">Linked contacts (${m.length})</p>
          <ul class="list-plain">${m.map(_=>`<li>${e.esc(_.name)} \u2014 ${e.esc(_.role||"")} ${_.email?`<span class="muted">${e.esc(_.email)}</span>`:""}</li>`).join("")||"<li class='muted'>None</li>"}</ul>
        </aside>`)}let H=A>0?`
      <div class="crm-import-banner">
        <div>
          <p class="body-md"><strong>${A}</strong> unique company name${A===1?"":"s"} on contacts not yet linked to company records.</p>
          <p class="body-sm muted">Import creates company rows and links your existing contacts automatically.</p>
        </div>
        <button type="button" class="button-primary button-sm" data-crm-import-companies>Import from contacts</button>
      </div>`:"",k=Q?"":`
      <div class="crm-empty-state">
        <p class="body-md">No company records yet.</p>
        <p class="body-sm muted">${A>0?"Import from contacts above, or add a company manually.":"Add companies manually, or enter company names when adding contacts."}</p>
      </div>`;return`
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <h3 class="title-sm">Companies</h3>
            <p class="body-sm muted">${w.length} account${w.length===1?"":"s"}</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-outline-on-dark button-sm" data-goto="outreach">Start outreach</button>
            <button type="button" class="button-outline-on-dark button-sm" data-crm-reload>Refresh</button>
            <button type="button" class="button-primary button-sm" data-toggle-ui="crmCompanyFormOpen">${L?"Hide form":"Add company"}</button>
          </div>
        </div>
        ${H}
        ${L?`
        <form class="human-form" id="crm-company-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Company name"></label>
            <label class="human-field"><span class="caption-uppercase">World</span>
              <select class="text-input-on-dark" name="world_id" required>${e.renderWorldOptionsForCrm(j)}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Sector</span>
              <input class="text-input-on-dark" name="sector" placeholder="e.g. Manufacturing"></label>
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${U("prospect")}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Website</span>
              <input class="text-input-on-dark" name="website" placeholder="https://\u2026"></label>
            <label class="human-field"><span class="caption-uppercase">LinkedIn</span>
              <input class="text-input-on-dark" name="linkedin_url" placeholder="https://linkedin.com/company/\u2026"></label>
          </div>
          <label class="human-field"><span class="caption-uppercase">Notes</span>
            <textarea class="text-input-on-dark" name="notes" rows="2"></textarea></label>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save company</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="crmCompanyFormOpen">Cancel</button>
          </div>
        </form>`:""}
      </section>
      <section class="band-light span-12 crm-companies-layout">
        ${k||`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Sector</th><th>Status</th><th>Contacts</th><th>Last contact</th></tr></thead>
        <tbody>${Q}</tbody></table></div>`}
        ${se}
      </section>`}function p(){let w=e.state._crm?.pipeline||{},A=Object.entries(w).map(([U,Q])=>`<div class="kv"><span class="k">${e.esc(U)}</span><span class="v">${Q}</span></div>`).join("")||"<p class='muted'>No pipeline data</p>",L=e.state._crmCompanies?.companies||[],M={};L.forEach(U=>{let Q=U.status||"prospect";M[Q]=(M[Q]||0)+1});let j=Object.entries(M).map(([U,Q])=>`<div class="kv"><span class="k">${e.esc(U)}</span><span class="v">${Q} companies</span></div>`).join("")||"<p class='muted'>No company pipeline data</p>";return`<section class="driver-card span-6"><p class="caption-uppercase">Contact pipeline</p><div style="margin-top:var(--space-sm)">${A}</div></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Company pipeline</p><div style="margin-top:var(--space-sm)">${j}</div></section>`}function h(){let w=e.crmTab(),A={contacts:e.state._crm?.contacts?.length||0,companies:e.state._crmCompanies?.companies?.length||0},L="";return w==="contacts"?L=e.renderCrmContactsPanel():w==="companies"?L=e.renderCrmCompaniesPanel():L=e.renderCrmPipelinePanel(),`<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <h2 class="title-md" style="text-wrap:balance">CRM</h2>
            <p class="body-sm muted">Contacts, companies, and pipeline. Batch outreach lives on the <button type="button" class="button-tertiary-text button-sm" data-goto="outreach">Outreach</button> page.</p>
          </div>
        </div>
        ${e.renderCrmTabs(A)}
      </section>
      ${L}
    </div>`}async function r(){let w=e.crmTab(),A=e.currentWorldId(),L=w==="companies"?"?include_unassigned=1":A&&A!=="root"?`?world_id=${encodeURIComponent(A)}&include_unassigned=1`:"?include_unassigned=1";e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[M,j]=await Promise.all([e.api("/crm/contacts"),e.api(`/crm/companies${L}`)]);e.state._crm=M,e.state._crmCompanies=j}catch(M){e.state._crmCompaniesError=M.message||"Could not load CRM data"}finally{e.state._crmCompaniesLoading=!1}}async function a(w){let A=new FormData(w),L=(A.get("name")||"").toString().trim();if(!L)return;let M=(A.get("company_id")||"").toString().trim();try{await e.api("/crm/contacts",{method:"POST",body:JSON.stringify({name:L,company_id:M?parseInt(M,10):null,role:(A.get("role")||"").toString().trim(),email:(A.get("email")||"").toString().trim(),status:(A.get("status")||"prospect").toString(),linkedin_url:(A.get("linkedin_url")||"").toString().trim(),phone:(A.get("phone")||"").toString().trim(),whatsapp_enabled:A.get("whatsapp_enabled")==="1",notes:(A.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmFormOpen=!1),await e.refresh(),e.render(),w.reset()}catch(j){alert(j.message)}}async function n(){let w=e.currentWorldId(),A=w&&w!=="root"?w:null;try{let L=await e.api("/crm/companies/import-from-contacts",{method:"POST",body:JSON.stringify({world_id:A})});await e.loadCrmData(),e.render();let M=`Imported ${L.created||0} companies and linked ${L.linked_contacts||0} contacts.`;e.state._toast?e.state._toast(M):alert(M)}catch(L){alert(L.message)}}async function u(w){let A=new FormData(w),L=(A.get("name")||"").toString().trim(),M=(A.get("world_id")||"").toString().trim();if(!(!L||!M))try{await e.api("/crm/companies",{method:"POST",body:JSON.stringify({name:L,world_id:M,sector:(A.get("sector")||"").toString().trim(),status:(A.get("status")||"prospect").toString(),website:(A.get("website")||"").toString().trim(),linkedin_url:(A.get("linkedin_url")||"").toString().trim(),notes:(A.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmCompanyFormOpen=!1),e.render(),w.reset()}catch(j){alert(j.message)}}async function i(w){if(w)try{let A=await e.api(`/crm/companies/${encodeURIComponent(w)}`);e.state._crmCompanyDetail=A,e.state.ui||(e.state.ui={}),e.state.ui.crmCompanyDetail=w,e.render()}catch(A){alert(A.message)}}async function f(w,A){if(!(!w||!A))try{await e.api(`/crm/contacts/${encodeURIComponent(w)}`,{method:"PATCH",body:JSON.stringify({status:A})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(L){alert(L.message)}}async function O(w,A){if(w)try{await e.api(`/crm/contacts/${encodeURIComponent(w)}`,{method:"PATCH",body:JSON.stringify({whatsapp_enabled:!!A})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(L){alert(L.message)}}async function I(w){if(w)try{let A=await e.api(`/whatsapp/messages?contact_id=${encodeURIComponent(w)}`);e.state._crmWaThread=A.messages||[],e.render()}catch(A){alert(A.message)}}async function y(w,A){let L=parseInt(A,10)||7;await e.api(`/crm/contacts/${w}/followup`,{method:"POST",body:JSON.stringify({days:L}),timeoutMs:15e3}),e.state._crm=await e.api("/crm/contacts"),e.currentView==="crm"&&e.render()}e.crmTab=$,e.renderWorldOptionsForCrm=S,e.renderCrmTabs=b,e.renderCrmContactsPanel=s,e.renderCrmCompaniesPanel=g,e.renderCrmPipelinePanel=p,e.renderCrm=h,e.loadCrmData=r,e.submitCrmContact=a,e.importCrmCompaniesFromContacts=n,e.submitCrmCompany=u,e.openCrmCompanyDetail=i,e.updateCrmStatus=f,e.updateCrmWhatsapp=O,e.loadCrmWaThread=I,e.scheduleCrmFollowup=y}function Le(e){function $(){return e.state.ui?.crmOutreachWorld||e.currentWorldId()}function S(){let t=e.routeParams?.campaignId,o=e.state.ui?.crmCampaignId;return t||o||null}async function b(){let t=S();t&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${t}/review`),e.render(),e.fitAllOutreachTextareas?.())}function s(){let t=e.state._crmCampaignReview,o=t?.campaign;return o?.status==="done"||t?.done&&!t?.pending_count?"complete":t?.campaign&&["review"].includes(o.status)&&t.pending_count>0?"review":t?.campaign&&["review"].includes(o.status)&&!t.pending_count?"complete":e.state._crmOutreachJob?.active||["researching","drafting","created"].includes(o?.status||e.state._crmOutreachJob?.status)||e.state.ui?.crmCampaignId&&o&&!["review","done","failed"].includes(o.status)?"running":"setup"}function g(){return e.state.ui?.crmOutreachBatch||5}function p(){return e.state.ui?.crmOutreachSelected||[]}function h(){return e.state.ui||(e.state.ui={}),Array.isArray(e.state.ui.crmOutreachDraft)||(e.state.ui.crmOutreachDraft=[...p()]),e.state.ui.crmOutreachDraft}function r(){let t=[...h()].sort((d,c)=>d-c).join(","),o=[...p()].sort((d,c)=>d-c).join(",");return t!==o}function a(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachDraft=[],e.state.ui.crmOutreachSelected=[]}function n(){e.state.ui||(e.state.ui={}),Array.isArray(e.state.ui.crmOutreachDraft)||(e.state.ui.crmOutreachDraft=[...p()])}function u(){let t=g(),o=new Set(h()),d=p().length,c=r(),v=document.getElementById("outreach-company-picker");if(!v)return;v.querySelectorAll("[data-crm-company-toggle]").forEach(J=>{let ee=parseInt(J.dataset.crmCompanyToggle,10),Y=o.has(ee);J.checked=Y,J.disabled=!Y&&o.size>=t,J.closest(".outreach-company-row")?.classList.toggle("is-selected",Y)});let T=v.querySelector(".outreach-select-meter__fill");T&&(T.style.width=`${Math.min(100,o.size/t*100)}%`);let R=document.getElementById("outreach-draft-count");R&&(R.textContent=String(o.size));let V=document.getElementById("outreach-batch-max");V&&(V.textContent=` / ${t}`);let N=document.getElementById("outreach-select-meter");N&&(N.setAttribute("aria-valuenow",String(o.size)),N.setAttribute("aria-valuemax",String(t)));let P=document.getElementById("outreach-saved-count");P&&(P.textContent=String(d));let z=document.getElementById("outreach-selection-dirty");z&&(z.hidden=!c);let W=document.getElementById("outreach-save-companies");W&&(W.disabled=!c||o.size===0,W.classList.toggle("is-pulse",c&&o.size>0));let X=document.getElementById("outreach-start-btn");if(X){let J=$(),ee=d>0&&J!=="root"&&!c;X.disabled=!ee,c?X.title="Save your company selection before starting":d?X.title="":X.title="Select and save at least one company"}let K=document.getElementById("outreach-batch-hint");K&&(K.textContent=o.size>=t?`Batch limit reached (${t})`:`Up to ${t} companies per campaign`)}function i(t){let o=parseInt(t.dataset.crmCompanyToggle,10);if(!o)return;e.state.ui||(e.state.ui={});let d=g(),c=new Set(h());if(t.checked){if(c.size>=d){t.checked=!1;return}c.add(o)}else c.delete(o);e.state.ui.crmOutreachDraft=[...c],u()}function f(){e.state.ui||(e.state.ui={});let t=h();if(!t.length)return;e.state.ui.crmOutreachSelected=[...t];let o=$();if(o)try{localStorage.setItem(`fos_outreach_sel_${o}`,JSON.stringify(t))}catch{}u();let d=document.getElementById("outreach-save-companies");d&&(d.classList.add("is-saved-flash"),setTimeout(()=>d?.classList.remove("is-saved-flash"),600))}function O(t){e.state.ui||(e.state.ui={});let o=parseInt(t,10)||5;e.state.ui.crmOutreachBatch=o;let d=h();d.length>o&&(e.state.ui.crmOutreachDraft=d.slice(0,o)),u()}function I(t){let o=(t||"").trim().toLowerCase();document.querySelectorAll("#outreach-company-picker .outreach-company-row").forEach(d=>{let c=(d.dataset.search||"").toLowerCase();d.hidden=!!(o&&!c.includes(o))})}function y(){let t=$();return(e.state._crmCompanies?.companies||[]).filter(o=>t&&t!=="root"&&o.world_id&&o.world_id!==t?!1:o.status==="prospect"||!o.status)}function w(t){if(!t||t.tagName!=="TEXTAREA")return;t.style.height="0px";let o=getComputedStyle(t),d=parseFloat(o.minHeight)||112;t.style.height=`${Math.max(d,t.scrollHeight)}px`,t.style.overflowY="hidden"}function A(t=document){let o=[...t.querySelectorAll(".crm-draft-body--fit, .outreach-auto-textarea")];if(!o.length)return;let d=()=>o.forEach(w);d(),requestAnimationFrame(()=>{d(),requestAnimationFrame(d)})}function L(t){if(t.channel==="email"){if(!(t.subject||"").trim())return"Subject required";if(!(t.body||"").trim())return"Body required";if(!(t.email||"").trim())return"Contact has no email"}if(t.channel==="whatsapp"){if(!(t.body||"").trim())return"Message required";if((t.body||"").length>300)return"Max 300 characters";if(!t.whatsapp_enabled)return"WhatsApp not allowlisted";if(!(t.phone||"").trim())return"No phone on contact"}return""}function M(t){let o=[["setup","Setup"],["running","Research"],["review","Review & send"],["complete","Complete"]],c={setup:0,running:1,review:2,complete:3}[t]??0;return`<nav class="crm-outreach-steps" aria-label="Outreach progress">${o.map(([v,T],R)=>`<span class="${R<c?"crm-outreach-step crm-outreach-step--done":R===c?"crm-outreach-step crm-outreach-step--active":"crm-outreach-step"}">${e.esc(T)}</span>`).join("")}</nav>`}function j(){let t=e.state._crmOutreachJob||{},o=e.state._crmCampaignDetail?.campaign||e.state._crmCampaignReview?.campaign||{},d=t.phase||o.status||"Starting\u2026",v=(e.state._crmCampaignReview?.companies||e.state._crmCampaignDetail?.review?.companies||[]).length||o.batch_size||"?";return`<section class="driver-card span-12 crm-outreach-running">
      <p class="section-eyebrow">Outreach in progress</p>
      <h3 class="title-sm">${e.esc(o.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("running")}
      <div class="crm-outreach-progress-strip">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:40%"></div></div>
        <p class="body-md"><strong>${e.esc(d)}</strong></p>
        <p class="muted body-sm">Per-company vault + web research \u2192 campaign dossier \u2192 batch template \u2192 personalized drafts. You can leave this page.</p>
        <p class="muted body-sm">Batch: ${v} companies \xB7 World: <span data-active-world-label>${e.esc(e.activeWorldLabel())}</span></p>
      </div>
      <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-refresh>Refresh status</button>
    </section>`}function U(t){let o=t.progress||{},d=o.by_status||{};return`<section class="driver-card span-12">
      <p class="section-eyebrow">Campaign complete</p>
      <h3 class="title-sm">${e.esc(t.campaign?.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("complete")}
      <div class="crm-outreach-summary">
        <div class="kv"><span class="k">Sent</span><span class="v">${d.sent||0}</span></div>
        <div class="kv"><span class="k">Skipped</span><span class="v">${d.skipped||0}</span></div>
        <div class="kv"><span class="k">Failed</span><span class="v">${d.failed||0}</span></div>
        <div class="kv"><span class="k">Companies</span><span class="v">${o.companies_complete||0}/${o.companies_total||0}</span></div>
      </div>
      <div class="human-form__actions" style="margin-top:var(--space-md)">
        <button type="button" class="button-primary button-sm" data-crm-outreach-back>Start new campaign</button>
      </div>
    </section>`}function Q(t){let o=t.campaign,d=t.strategy||{},c=t.template||{},v=t.dossier_md||"",T=t.current_company,R=t.current_research||{},V=t.current_drafts||[],N=t.progress||{},P=V.filter(B=>B.channel==="email"),z=V.filter(B=>B.channel==="whatsapp"),W=T?.company_name||T?.name||"Company",X=N.company_index||1,K=N.companies_total||1,J=S(),ee=T?.company_id??t.current_company_id??"",Y=B=>{let le=e.draftApproveDisabledReason(B),Ye=(B.body||"").length;return`<div class="crm-draft-card driver-card outreach-draft-card" data-draft-id="${B.id}">
        <div class="crm-draft-card__head">
          <p class="caption-uppercase">${B.channel==="email"?"Gmail":"WhatsApp"} \u2192 ${e.esc(B.contact_name||"Contact")}</p>
          ${B.channel==="email"?`<span class="muted body-sm">${e.esc(B.email||"")}</span>`:`<span class="muted body-sm">${e.esc(B.phone||"")}</span>`}
        </div>
        ${B.personalization_notes?`<p class="body-md muted outreach-draft-notes">${e.esc(B.personalization_notes)}</p>`:""}
        ${B.channel==="email"?`<label class="human-field outreach-draft-field"><span class="caption-uppercase">Subject</span>
          <input class="text-input-on-dark crm-draft-subject" data-draft-id="${B.id}" value="${e.esc(B.subject||"")}"></label>`:""}
        <label class="human-field outreach-draft-field"><span class="caption-uppercase">Message</span>
          <textarea class="text-input-on-dark crm-draft-body crm-draft-body--fit" data-draft-id="${B.id}" data-channel="${e.esc(B.channel)}" rows="1">${e.esc(B.body||"")}</textarea>
          ${B.channel==="whatsapp"?`<span class="caption muted crm-wa-count" data-draft-id="${B.id}">${Ye}/300</span>`:""}
        </label>
        <div class="outreach-ai-edit" data-draft-ai-panel="${B.id}">
          <label class="human-field outreach-draft-field"><span class="caption-uppercase">AI edit instruction</span>
            <input type="text" class="text-input-on-dark outreach-ai-instruction" data-draft-id="${B.id}" placeholder="e.g. shorten, more direct, add energy savings hook\u2026"></label>
          <div class="human-form__actions outreach-ai-actions">
            <button type="button" class="button-outline-on-dark button-sm" data-outreach-ai-edit="${B.id}">Apply AI edit</button>
            <label class="human-field--checkbox outreach-web-toggle">
              <input type="checkbox" data-outreach-ai-web="${B.id}">
              <span class="body-sm">Web search first</span>
            </label>
          </div>
        </div>
        <div class="human-form__actions">
          <button type="button" class="button-primary button-sm" data-crm-draft-approve="${B.id}" ${le?'disabled title="'+e.esc(le)+'"':""}>Approve &amp; Send</button>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-draft-skip="${B.id}">Skip message</button>
        </div>
        ${B.error_message?`<p class="crm-draft-error">${e.esc(B.error_message)}</p>`:""}
        ${le?`<p class="muted body-sm">${e.esc(le)}</p>`:""}
      </div>`},oe=R.narrative||R.summary||"",ie=c.email_body||c.email_subject?`
      <details class="outreach-template-details" open>
        <summary class="caption-uppercase">Batch template (master copy)</summary>
        <div class="outreach-template-body">
          ${c.email_subject?`<p class="body-sm"><strong>Subject:</strong> ${e.esc(c.email_subject)}</p>`:""}
          ${c.email_body?`<pre class="body-sm outreach-template-pre">${e.esc(c.email_body)}</pre>`:""}
          ${c.whatsapp_body?`<p class="caption-uppercase" style="margin-top:var(--space-sm)">WhatsApp template</p><pre class="body-sm outreach-template-pre">${e.esc(c.whatsapp_body)}</pre>`:""}
        </div>
      </details>`:"";return`<section class="driver-card span-12 outreach-review">
      <div class="human-panel__head">
        <div>
          <p class="section-eyebrow">Review &amp; send</p>
          <h3 class="title-sm">${e.esc(o.name||"Campaign")}</h3>
          <p class="muted body-sm">Company ${X} of ${K} \xB7 ${t.pending_count||0} message(s) left</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-back>Exit review</button>
      </div>
      ${e.renderOutreachSteps("review")}
      <div class="crm-outreach-progress-meta">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:${Math.round((N.companies_complete||0)/Math.max(K,1)*100)}%"></div></div>
        <div class="crm-outreach-stats">
          <span class="badge-pill">Sent ${(N.by_status||{}).sent||0}</span>
          <span class="badge-pill">Skipped ${(N.by_status||{}).skipped||0}</span>
          <span class="badge-pill">Pending ${t.pending_count||0}</span>
        </div>
      </div>

      <details class="outreach-dossier-panel"${v?" open":""}>
        <summary class="caption-uppercase">Campaign dossier \u2014 all companies</summary>
        <p class="body-sm muted">Research file for this batch. Edit and save \u2014 used as context for AI edits.</p>
        <textarea id="outreach-dossier-editor" class="text-input-on-dark outreach-dossier-editor" rows="12">${e.esc(v)}</textarea>
        <div class="human-form__actions">
          <button type="button" class="button-outline-on-dark button-sm" data-outreach-save-dossier="${J||""}">Save dossier</button>
        </div>
      </details>

      ${ie}

      <details class="crm-strategy-details">
        <summary class="caption-uppercase">Cohort strategy</summary>
        <pre class="body-sm muted outreach-strategy-pre">${e.esc(JSON.stringify(d,null,2))}</pre>
      </details>

      ${T?`<div class="crm-company-review driver-card outreach-company-review">
        <div class="human-panel__head">
          <h4 class="title-sm">${e.esc(W)}</h4>
          <div class="human-form__actions">
            <button type="button" class="button-outline-on-dark button-sm" data-outreach-refresh-research="${ee}" data-campaign-id="${J||""}">Refresh research</button>
            <button type="button" class="button-outline-on-dark button-sm" data-outreach-refresh-research-web="${ee}" data-campaign-id="${J||""}">Search web &amp; refresh</button>
            <button type="button" class="button-outline-on-dark button-sm" data-crm-skip-company="${ee}">Skip company</button>
          </div>
        </div>
        <p class="body-sm muted">${e.esc(R.sector||T.sector||"")}</p>
        ${oe?`<div class="outreach-research-narrative"><p class="caption-uppercase">Company research</p><p class="body-md outreach-narrative-text">${e.esc(oe)}</p></div>`:""}
        ${(R.web_hits||[]).length?`<details class="outreach-research-details"><summary class="caption-uppercase">Web signals (${R.web_hits.length})</summary><ul class="list-plain">${R.web_hits.slice(0,5).map(B=>`<li class="body-sm">${e.esc(B.snippet||B.title||"")}${B.url?` <a href="${e.esc(B.url)}" target="_blank" rel="noopener">link</a>`:""}</li>`).join("")}</ul></details>`:""}
        ${(R.vault_files_used||[]).length?`<details class="outreach-research-details"><summary class="caption-uppercase">Vault files (${R.vault_files_used.length})</summary><ul class="list-plain">${R.vault_files_used.map(B=>`<li class="body-sm">${e.esc(B.title||"doc #"+B.doc_id)}</li>`).join("")}</ul></details>`:""}
      </div>`:""}

      ${P.length?'<p class="caption-uppercase outreach-section-label">Email drafts</p>':""}
      ${P.map(Y).join("")}
      ${z.length?'<p class="caption-uppercase outreach-section-label">WhatsApp drafts</p>':""}
      ${z.map(Y).join("")}
      ${!V.length&&T?'<p class="muted">No drafts for this company \u2014 contacts may lack email or WhatsApp allowlist.</p>':""}
    </section>`}function se(t){e.state.ui||(e.state.ui={});let o=[];if(t)try{let d=localStorage.getItem(`fos_outreach_sel_${t}`),c=d?JSON.parse(d):[];o=Array.isArray(c)?c.filter(v=>Number.isFinite(v)):[]}catch{}e.state.ui.crmOutreachSelected=o,e.state.ui.crmOutreachDraft=[...o]}function H(){n();let t=e.state._crmCampaigns?.campaigns||[],o=$(),d=y(),c=g(),v=new Set(h()),T=p().length,R=r(),N=((e.state.worlds||e.state._worldFull?.worlds||{}).children||[]).length>0,P=e.state._crmCompaniesLoading,z=e.state._crmCompaniesError,W=d.map(Y=>{let oe=v.has(Y.id),ie=Y.contact_count||0,B=`${Y.name||""} ${Y.sector||""}`.trim();return`<label class="outreach-company-row human-field--checkbox${oe?" is-selected":""}" data-search="${e.esc(B)}">
        <input type="checkbox" data-crm-company-toggle="${Y.id}" ${oe?"checked":""} ${v.size>=c&&!oe?"disabled":""}>
        <span class="outreach-company-row__main">
          <span class="outreach-company-row__name">${e.esc(Y.name)}</span>
          <span class="outreach-company-row__meta muted">${e.esc(Y.sector||"\u2014")} \xB7 ${ie} contact${ie===1?"":"s"}</span>
        </span>
      </label>`}).join(""),X=[5,10,15,20].map(Y=>`<option value="${Y}"${c===Y?" selected":""}>${Y}</option>`).join(""),K=t.slice(0,12).map(Y=>`<tr>
        <td><button type="button" class="${Y.status==="review"?"button-primary":"button-tertiary-text"} button-sm" data-crm-campaign="${Y.id}">${e.esc(Y.name)}</button></td>
        <td><span class="badge-pill badge-pill--${e.esc(Y.status)}">${e.esc(Y.status)}</span></td>
        <td class="muted">${e.esc((Y.created_at||"").slice(0,10))}</td>
        <td>${Y.status==="review"?`<button type="button" class="button-outline-on-dark button-sm" data-crm-campaign="${Y.id}">Continue review</button>`:""}</td>
      </tr>`).join("")||'<tr><td colspan="4" class="muted">No campaigns yet</td></tr>',J=d.length?`<div id="outreach-company-picker" class="outreach-company-picker">
          <div class="outreach-picker-toolbar">
            <div class="outreach-picker-toolbar__head">
              <p class="caption-uppercase">Companies</p>
              <div class="outreach-picker-toolbar__counts">
                <span class="outreach-count-pill" title="Currently selected (not yet saved)">
                  <strong id="outreach-draft-count">${v.size}</strong><span class="muted" id="outreach-batch-max"> / ${c}</span>
                </span>
                <span class="outreach-count-pill outreach-count-pill--saved" title="Saved for this campaign">
                  <strong id="outreach-saved-count">${T}</strong> saved
                </span>
                <span id="outreach-selection-dirty" class="outreach-dirty-badge"${R?"":" hidden"}>Unsaved</span>
              </div>
            </div>
            <div class="outreach-select-meter" id="outreach-select-meter" role="progressbar" aria-valuenow="${v.size}" aria-valuemin="0" aria-valuemax="${c}" aria-label="Selection progress">
              <div class="outreach-select-meter__fill" style="width:${Math.min(100,v.size/c*100)}%"></div>
            </div>
            <p class="body-sm muted" id="outreach-batch-hint">${v.size>=c?`Batch limit reached (${c})`:`Pick up to ${c}, then save`}</p>
            <div class="outreach-picker-toolbar__actions">
              <input type="search" id="outreach-company-search" class="text-input-on-dark outreach-company-search" placeholder="Filter companies\u2026" autocomplete="off">
              <button type="button" id="outreach-save-companies" class="button-outline-on-dark button-sm" data-outreach-save-companies ${R&&v.size?"":"disabled"}>Save selection</button>
            </div>
          </div>
          <div class="outreach-company-list">${W}</div>
        </div>`:`<div class="crm-outreach-empty">
          <p class="body-md">No prospect companies for this world.</p>
          <p class="body-sm muted">Import from CRM contacts or add companies manually, then return here to build a batch.</p>
          <div class="human-form__actions">
            <button type="button" class="button-primary button-sm" data-outreach-open-crm-companies>Open companies in CRM</button>
          </div>
        </div>`,ee=T>0&&o!=="root"&&!R;return`<section class="driver-card span-12 human-panel outreach-setup">
      <div class="human-panel__head">
        <div>
          <h3 class="title-sm">Batch outreach</h3>
          <p class="body-sm muted">Pick companies, save your batch, then start \u2014 research and drafts run in the background.</p>
        </div>
      </div>
      ${e.renderOutreachSteps("setup")}
      ${N?"":'<p class="crm-outreach-warn">Create a sub-world under <strong>World</strong> first \u2014 outreach needs a venture context for vault research.</p>'}
      ${z?`<p class="crm-draft-error">${e.esc(z)}</p>`:""}
      <form class="human-form outreach-setup-form" id="crm-outreach-form">
        <div class="outreach-setup-grid">
          <label class="human-field"><span class="caption-uppercase">World</span>
            <select class="text-input-on-dark" name="world_id" id="crm-outreach-world">${e.renderWorldOptionsForCrm(o)}</select></label>
          <label class="human-field"><span class="caption-uppercase">Batch size</span>
            <select class="text-input-on-dark" name="batch_size" id="crm-outreach-batch">${X}</select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Outreach brief</span>
          <textarea class="text-input-on-dark outreach-auto-textarea" name="brief" rows="1" placeholder="e.g. Indian manufacturing SMBs \u2014 energy cost savings, 15-min discovery call, direct tone"></textarea></label>
        ${P?'<p class="muted body-sm">Loading companies\u2026</p>':J}
        <div class="human-form__actions outreach-setup-actions">
          <button type="submit" id="outreach-start-btn" class="button-primary" ${ee?"":"disabled"}${R?' title="Save your company selection before starting"':T?"":' title="Select and save at least one company"'}>
            Start outreach${T?` (${T} companies)`:""}
          </button>
        </div>
      </form>
      <section class="outreach-history">
        <p class="caption-uppercase">Recent campaigns</p>
        <div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${K}</tbody></table></div>
      </section>
    </section>`}function k(){let t=e.outreachStep(),o=e.state._crmCampaignReview;return t==="running"?e.renderOutreachRunningPanel():t==="complete"&&o?.campaign?e.renderOutreachCompletePanel(o):t==="review"&&o?.campaign?e.renderOutreachReviewPanel(o):e.renderOutreachSetupPanel()}function l(){return`<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <nav class="body-sm muted" aria-label="Breadcrumb" style="margin-bottom:var(--space-xs)">
              <button type="button" class="button-tertiary-text button-sm" data-goto="crm">CRM</button>
              <span aria-hidden="true"> / </span>
              <span>Outreach</span>
            </nav>
            <h2 class="title-md" style="text-wrap:balance">Outreach</h2>
            <p class="body-sm muted">Batch campaigns \u2014 research, draft, and approve every message before send.</p>
          </div>
        </div>
      </section>
      ${e.renderOutreachBody()}
    </div>`}async function m(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld||(e.state.ui.crmOutreachWorld=e.currentWorldId());let t=e.outreachWorldId(),o=t&&t!=="root"?`?world_id=${encodeURIComponent(t)}&include_unassigned=1`:"?include_unassigned=1",d=t&&t!=="root"?`?world_id=${encodeURIComponent(t)}`:"",c=e.routeParams?.campaignId||e.state.ui?.crmCampaignId;e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[v,T]=await Promise.all([e.api(`/crm/companies${o}`),e.api(`/crm/outreach/campaigns${d}`).catch(()=>({campaigns:[]}))]);if(e.state._crmCompanies=v,e.state._crmCampaigns=T,c||Array.isArray(e.state.ui.crmOutreachDraft)||(p().length?e.state.ui.crmOutreachDraft=[...p()]:se(t)),c){e.state.ui.crmCampaignId=c;let[R,V]=await Promise.all([e.api(`/crm/outreach/campaigns/${c}`).catch(()=>null),e.api(`/crm/outreach/campaigns/${c}/review`).catch(()=>null)]);e.state._crmCampaignDetail=R,e.state._crmCampaignReview=V?.campaign?V:R?.review;let N=e.state._crmCampaignReview?.campaign||R?.campaign;N&&["researching","drafting","created"].includes(N.status)?(e.state._crmOutreachJob={active:!0,phase:N.status,status:N.status},e.state._crmOutreachPollId||e.pollCrmOutreachJob(c)):N?.status==="review"&&(e.state._crmOutreachJob={phase:"Ready for review",active:!1})}}catch(v){e.state._crmCompaniesError=v.message||"Could not load outreach data"}finally{e.state._crmCompaniesLoading=!1}}async function _(t){let o=new FormData(t),d=(o.get("world_id")||"").toString().trim(),c=parseInt(o.get("batch_size")||"5",10)||5,v=(o.get("brief")||"").toString().trim(),T=p();if(r())return alert("Save your company selection before starting.");if(!d||d==="root")return alert("Select a sub-world for outreach (not Main world).");if(!T.length)return alert("Select and save at least one company.");if(!v)return alert("Add a brief so the agent knows what kind of message to write.");try{let R=await e.api("/crm/outreach/campaigns",{method:"POST",body:JSON.stringify({world_id:d,batch_size:c,brief:v,company_ids:T})});await e.api(`/crm/outreach/campaigns/${R.campaign_id}/start`,{method:"POST"}),e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=[],e.state.ui.crmOutreachDraft=[];try{localStorage.removeItem(`fos_outreach_sel_${d}`)}catch{}e.goView("outreach",{params:{campaignId:R.campaign_id}}),e.pollCrmOutreachJob(R.campaign_id)}catch(R){alert(R.message)}}async function C(t,o=!1){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId);let d=async()=>{try{let c=await e.api(`/crm/outreach/campaigns/${t}`),v=c.campaign||{},T=c.review||{},R=c.job||{};if(e.state._crmCampaignDetail=c,v.status==="review"||v.status==="done"||v.status==="failed"){e.state._crmOutreachJob={active:!1,phase:v.status==="review"?"Ready for review":v.status},e.state._crmCampaignReview=T.campaign?T:await e.api(`/crm/outreach/campaigns/${t}/review`),e.state._crmOutreachPollId=null,e.currentView==="outreach"&&e.render();return}e.state._crmOutreachJob={active:!0,phase:R.phase||v.status||"running\u2026",status:v.status},e.currentView==="outreach"&&e.render(),o||(e.state._crmOutreachPollId=setTimeout(d,2500))}catch{o||(e.state._crmOutreachPollId=setTimeout(d,4e3))}};o?await d():e.state._crmOutreachPollId=setTimeout(d,500)}async function D(t){t&&e.goView("outreach",{params:{campaignId:parseInt(t,10)}})}function E(){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null,e.state.ui&&(e.state.ui.crmCampaignId=null),e.state._crmCampaignReview=null,e.state._crmCampaignDetail=null,e.state._crmOutreachJob=null,e.goView("outreach",{params:{}})}function G(t){i(t)}async function q(t){let o=S(),d=parseInt(t,10);if(!o||!d){alert("Could not skip company \u2014 campaign context missing. Try reopening the campaign from Recent campaigns.");return}try{await e.api(`/crm/outreach/campaigns/${o}/companies/${d}/skip`,{method:"POST"}),await e.refreshOutreachReview()}catch(c){alert(c.message)}}async function te(t){let o=document.querySelector(`.crm-draft-subject[data-draft-id="${t}"]`),d=document.querySelector(`.crm-draft-body[data-draft-id="${t}"]`),c={};o&&(c.subject=o.value),d&&(c.body=d.value),Object.keys(c).length&&await e.api(`/crm/outreach/drafts/${t}`,{method:"PATCH",body:JSON.stringify(c)})}async function Z(t){if(t)try{await e.saveCrmDraftEdits(t);let o=await e.api(`/crm/outreach/drafts/${t}/approve-send`,{method:"POST"});if(o.error)return alert(o.error);await e.refreshOutreachReview()}catch(o){alert(o.message)}}async function ae(t){let o=t||S();if(!o)return alert("No campaign selected");let c=document.getElementById("outreach-dossier-editor")?.value??"";try{await e.api(`/crm/outreach/campaigns/${o}/dossier`,{method:"PATCH",body:JSON.stringify({dossier_md:c})}),e.state._crmCampaignReview&&(e.state._crmCampaignReview.dossier_md=c)}catch(v){alert(v.message)}}async function x(t,o=!1){if(!t)return;let c=(document.querySelector(`.outreach-ai-instruction[data-draft-id="${t}"]`)?.value||"").trim();if(!c)return alert("Enter an instruction for the AI edit (e.g. shorten, more direct).");try{await e.saveCrmDraftEdits(t);let v=await e.api(`/crm/outreach/drafts/${t}/ai-edit`,{method:"POST",body:JSON.stringify({instruction:c,web_search:o})});if(v.error)return alert(v.error);await e.refreshOutreachReview()}catch(v){alert(v.message)}}async function re(t,o=!1){let d=S(),c=parseInt(t,10);if(!d||!c)return alert("Missing campaign or company");try{await e.api(`/crm/outreach/campaigns/${d}/companies/${c}/research`,{method:"POST",body:JSON.stringify({web_search:o})}),await e.refreshOutreachReview()}catch(v){alert(v.message)}}async function ne(t){if(t)try{await e.api(`/crm/outreach/drafts/${t}/skip`,{method:"POST"}),await e.refreshOutreachReview()}catch(o){alert(o.message)}}e.outreachWorldId=$,e.outreachCampaignId=S,e.refreshOutreachReview=b,e.outreachStep=s,e.draftApproveDisabledReason=L,e.renderOutreachSteps=M,e.renderOutreachRunningPanel=j,e.renderOutreachCompletePanel=U,e.renderOutreachReviewPanel=Q,e.renderOutreachSetupPanel=H,e.renderOutreachBody=k,e.renderOutreach=l,e.loadOutreachData=m,e.submitCrmOutreach=_,e.pollCrmOutreachJob=C,e.openCrmCampaignReview=D,e.closeCrmCampaignReview=E,e.fitOutreachTextarea=w,e.fitAllOutreachTextareas=A,e.toggleOutreachDraftCompany=i,e.saveOutreachCompanySelection=f,e.setOutreachBatchSize=O,e.filterOutreachCompanyList=I,e.syncOutreachCompanyPickerUi=u,e.restoreOutreachSelectionForWorld=se,e.resetOutreachCompanySelection=a,e.toggleCrmOutreachCompany=G,e.saveOutreachDossier=ae,e.aiEditOutreachDraft=x,e.refreshOutreachResearch=re,e.skipCrmCompany=q,e.saveCrmDraftEdits=te,e.approveCrmDraft=Z,e.skipCrmDraft=ne}function De(e){function $(){let p=e.state._goals||{},h=!!e.state.ui?.goalsFormOpen,r=!!e.state.ui?.reminderFormOpen,a=(p.active||[]).map(f=>`<li class="goal-row">
      <span><strong>${e.esc(f.title)}</strong>${f.detail?" \u2014 "+e.esc(f.detail):""}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goal-done="${f.id}">Done</button>
    </li>`).join("")||"<li class='muted'>No active goals \u2014 add one below.</li>",n=(e.state.tasks||[]).map(f=>`<li>${e.esc(f.title)} <span class="muted">P${f.priority||3}</span></li>`).join("")||"<li class='muted'>No open tasks</li>",u=(p.reminders||[]).map(f=>`<li class="reminder-row">
      <span>${e.esc(f.text)} <span class="muted">${e.esc((f.due_at||"").slice(0,16).replace("T"," "))}</span></span>
      <span class="reminder-row__actions">
        <button type="button" class="button-outline-on-dark button-sm" data-reminder-done="${f.id}">Done</button>
        <button type="button" class="button-tertiary-text button-sm" data-reminder-cancel="${f.id}">Cancel</button>
      </span>
    </li>`).join("")||"<li class='muted'>No reminders</li>",i=(p.plans||[]).map(f=>`<li>${e.esc(f.goal)}</li>`).join("")||"<li class='muted'>No open plans</li>";return`<div class="dashboard-grid">
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Goals</p>
            <h3 class="title-sm">Outcomes you own</h3>
            <p class="body-md muted">Track goals and reminders directly \u2014 no agent required.</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-primary button-sm" data-toggle-ui="goalsFormOpen">${h?"Hide goal form":"New goal"}</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="reminderFormOpen">${r?"Hide reminder":"Reminder"}</button>
          </div>
        </div>
        ${h?`
        <form class="human-form" id="goal-create-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Goal</span>
              <input class="text-input-on-dark" name="title" required placeholder="What are you driving toward?"></label>
            <label class="human-field"><span class="caption-uppercase">Priority</span>
              <select class="text-input-on-dark" name="priority">
                <option value="1">P1 \u2014 critical</option>
                <option value="2">P2 \u2014 high</option>
                <option value="3" selected>P3 \u2014 normal</option>
                <option value="4">P4 \u2014 low</option>
                <option value="5">P5 \u2014 someday</option>
              </select></label>
          </div>
          <label class="human-field"><span class="caption-uppercase">Detail</span>
            <textarea class="text-input-on-dark" name="detail" rows="2" placeholder="Optional context"></textarea></label>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Add goal</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="goalsFormOpen">Cancel</button>
          </div>
        </form>`:""}
        ${r?`
        <form class="human-form" id="reminder-create-form" style="margin-top:var(--space-sm)">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Reminder</span>
              <input class="text-input-on-dark" name="text" required placeholder="Follow up with\u2026"></label>
            <label class="human-field"><span class="caption-uppercase">Due</span>
              <input class="text-input-on-dark" name="due_at" type="datetime-local" required></label>
          </div>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save reminder</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="reminderFormOpen">Cancel</button>
          </div>
        </form>`:""}
      </section>
      <section class="driver-card span-6"><p class="caption-uppercase">Active goals</p><ul class="list-plain goal-list" style="margin-top:var(--space-sm)">${a}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Open tasks</p><ul class="list-plain" style="margin-top:var(--space-sm)">${n}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Reminders</p><ul class="list-plain" style="margin-top:var(--space-sm)">${u}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Plans &amp; projects</p><ul class="list-plain" style="margin-top:var(--space-sm)">${i}</ul></section>
    </div>`}async function S(p){let h=new FormData(p),r=(h.get("title")||"").toString().trim();if(r)try{await e.api("/goals",{method:"POST",body:JSON.stringify({title:r,detail:(h.get("detail")||"").toString().trim(),priority:parseInt(h.get("priority")||"3",10)||3})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.goalsFormOpen=!1),await e.refresh(),e.render(),p.reset()}catch(a){alert(a.message)}}async function b(p){if(p)try{await e.api(`/goals/${encodeURIComponent(p)}`,{method:"PATCH",body:JSON.stringify({status:"done"})}),e.state._goals=await e.api("/goals"),await e.refresh(),e.render()}catch(h){alert(h.message)}}async function s(p){let h=new FormData(p),r=(h.get("text")||"").toString().trim(),a=(h.get("due_at")||"").toString().trim();if(!r||!a)return;let n=a.length===16?`${a}:00`:a;try{await e.api("/reminders",{method:"POST",body:JSON.stringify({text:r,due_at:n})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.reminderFormOpen=!1),e.render(),p.reset()}catch(u){alert(u.message)}}async function g(p,h){if(await e.api(`/reminders/${p}`,{method:"PATCH",body:JSON.stringify({status:h}),timeoutMs:15e3}),e.state._goals=await e.api("/goals"),e.currentView==="goals"&&e.render(),e.currentView==="dashboard"){let r=e.currentWorldId(),a=r&&r!=="root"?`?world_id=${encodeURIComponent(r)}`:"";e.state._nudges=(await e.api(`/nudges${a}`).catch(()=>({nudges:[]}))).nudges||[],e.render()}}e.renderGoals=$,e.submitGoal=S,e.markGoalDone=b,e.submitReminder=s,e.updateReminderStatus=g}function Te(e){function $(){let b=e.state._memoryResults||[],s=e.state._memoryFull||{},g=s.collections||[],p=s.knowledge_graph||{},h=b.map(a=>`<div class="memory-hit">
      <span class="badge-pill">${e.esc(a.collection)}</span>
      <p class="body-md" style="margin-top:var(--space-xxs);max-width:72ch">${e.esc(a.text)}</p></div>`).join(""),r=g.map(a=>`
      <div class="memory-collection">
        <h4>${e.esc(a.name)} <span class="muted">(${a.count} vectors)</span></h4>
        ${(a.samples||[]).map(n=>`<p class="memory-sample">${e.esc(n.text)}</p>`).join("")||"<p class='muted'>Empty collection</p>"}
      </div>`).join("");return`
      <div class="search-row">
        <input type="search" class="text-input-on-dark" id="memory-q" placeholder="Semantic search across all memory\u2026" value="${e.esc(e.state._memoryQ||"")}">
        <button class="button-primary" id="memory-search">Search</button>
      </div>
      <div class="graph-tabs">
        <button type="button" class="graph-tab ${e.memoryGraphTab==="graph"?"is-active":""}" data-memory-tab="graph">Memory graph</button>
        <button type="button" class="graph-tab ${e.memoryGraphTab==="collections"?"is-active":""}" data-memory-tab="collections">Collections</button>
        <button type="button" class="graph-tab ${e.memoryGraphTab==="search"?"is-active":""}" data-memory-tab="search">Search results</button>
      </div>
      <div id="memory-tab-graph" ${e.memoryGraphTab!=="graph"?"hidden":""}>
        <p class="body-md" style="margin-bottom:var(--space-sm)">Knowledge graph (${(p.entities||[]).length} entities, ${(p.relations||[]).length} relations) plus recent vector memory chunks.</p>
        <div id="graph-memory" class="graph-canvas"></div>
        <div class="graph-detail" id="graph-memory-detail">Click a node to inspect</div>
      </div>
      <div id="memory-tab-collections" ${e.memoryGraphTab!=="collections"?"hidden":""}>${r||"<p class='body-md'>No vector memory yet.</p>"}</div>
      <div id="memory-tab-search" ${e.memoryGraphTab!=="search"?"hidden":""}>
        <div id="memory-results">${h||'<p class="body-md">Search to find relevant memories.</p>'}</div>
      </div>`}async function S(){let b=e.$("#memory-q")?.value?.trim();if(e.state._memoryQ=b,!b)return;let s=await e.api("/memory/search?q="+encodeURIComponent(b));e.state._memoryResults=s.results,e.render()}e.renderMemory=$,e.searchMemory=S}function Pe(e){function $(s){let g=s.content||"";return s.role==="agent"||s.role==="assistant"?`<div class="msg-md history-msg__body">${window.FOSMarkdown?.render?.(g)||e.esc(g)}</div>`:`<p class="body-md history-msg__body">${e.esc(g)}</p>`}function S(){let g=(e.state._history||{}).sessions||[],p=e.state._artifacts||[],h=e.state._historySession,r=e.historyTab,a=g.length?g.map(i=>`
      <button type="button" class="history-session${h?.id===i.id?" is-active":""}" data-history-session="${e.esc(i.id)}">
        <span class="history-session__title">${e.esc(i.title||"Conversation")}</span>
        <span class="history-session__meta muted">${e.esc(i.specialist||"supervisor")} \xB7 ${i.message_count||0} msgs \xB7 ${e.fmtHistoryTime(i.updated_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No conversations yet. Ask the agent something to start a session.</p>",n="<p class='body-md muted'>Select a conversation to view messages, runs, and linked documents.</p>";if(h?.messages?.length){let i=h.messages.map(I=>`
        <div class="history-msg history-msg--${e.esc(I.role)}">
          <span class="caption-uppercase">${e.esc(I.role)}</span>
          ${e.renderHistoryMessageContent(I)}
          <span class="muted" style="font-size:11px">${e.fmtHistoryTime(I.created_at)}</span>
        </div>`).join(""),f=(h.runs||[]).map(I=>`
        <article class="history-run">
          <div class="history-run__head">
            <span class="mono">${e.esc(I.specialist||I.actor||"agent")}</span>
            <span class="muted">${I.duration_s||0}s</span>
          </div>
          ${e.renderLiveFlow((I.tools||[]).map(y=>({name:y.name,decision:y.decision,t:y.t})),"No tools")}
          ${I.assistant_reply?`<div class="history-run__reply msg-md">${window.FOSMarkdown?.render?.(I.assistant_reply)||e.esc(I.assistant_reply)}</div>`:""}
        </article>`).join("")||"",O=(h.artifacts||[]).map(I=>`
        <button type="button" class="history-doc-btn" data-open-document="${I.id}">
          <span class="badge-pill">${e.esc(I.kind)}</span>
          <span>${e.esc(I.title)}</span>
        </button>`).join("")||"<p class='muted'>No documents in this session.</p>";n=`
        <div class="history-detail__actions">
          <button type="button" class="button-primary button-sm" data-open-chat-session="${e.esc(h.id)}">Open in chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New conversation</button>
        </div>
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Messages</p>
        <div class="history-messages">${i}</div>
        ${f?`<p class="caption-uppercase" style="margin-top:var(--space-md)">Runs</p>${f}`:""}
        <p class="caption-uppercase" style="margin-top:var(--space-md)">Documents</p>
        <div class="history-artifacts">${O}</div>`}let u=p.length?p.map(i=>`
      <article class="history-doc-card" tabindex="0" data-open-document="${i.id}">
        <div class="history-doc-card__head">
          <span class="badge-pill">${e.esc(i.kind)}</span>
          <span class="muted">${e.fmtHistoryTime(i.created_at)}</span>
        </div>
        <h3 class="title-sm">${e.esc(i.title||"Untitled")}</h3>
        ${i.run_id?`<p class="world-meta">Run ${e.esc(i.run_id)}</p>`:""}
        <span class="history-doc-card__open">Open in workspace</span>
      </article>`).join(""):"<p class='body-md muted'>No agent documents yet. Markdown files and charts created by agents appear here.</p>";return`
      <header class="driver-card history-header">
        <div>
          <p class="section-eyebrow">Agent ledger</p>
          <h2 class="title-md">History</h2>
          <p class="body-md muted">Persistent conversations, runs, and documents created by agents.</p>
        </div>
      </header>
      <div class="graph-tabs">
        <button type="button" class="graph-tab ${r==="conversations"?"is-active":""}" data-history-tab="conversations">Conversations</button>
        <button type="button" class="graph-tab ${r==="documents"?"is-active":""}" data-history-tab="documents">Documents</button>
      </div>
      ${r==="conversations"?`<div class="history-layout">
        <section class="driver-card history-sessions">${a}</section>
        <section class="driver-card history-detail">${n}</section>
      </div>`:`<section class="driver-card history-documents-grid">${u}</section>`}`}async function b(s){e.state._historySelectedId=s;try{e.state._historySession=await e.api(`/history/sessions/${s}`)}catch{e.state._historySession=null}e.render()}e.renderHistoryMessageContent=$,e.renderHistory=S,e.loadHistorySession=b}function Ee(e){function $(){let b=e.state.approvals||[];return b.length?`<section class="driver-card">${b.map(s=>`
      <div class="approval-block">
        <div class="approval-meta caption-uppercase"><span class="mono">#${s.id}</span> \xB7 ${e.esc(s.tool_name)}</div>
        <div class="approval-summary body-md">${e.esc(s.summary)}</div>
        <div class="approval-actions">
          <button type="button" class="button-primary button-sm" data-approve="${s.id}">Approve</button>
          <button type="button" class="button-outline-on-dark button-sm" data-reject="${s.id}">Reject</button>
        </div>
      </div>`).join("")}</section>`:'<section class="driver-card empty-state"><p class="title-sm">No pending approvals</p></section>'}async function S(b,s){try{let g=await e.api(`/approvals/${b}/${s?"approve":"reject"}`,{method:"POST"});e.chatHistory.push({role:"system",text:g.result}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.refresh(),e.currentView==="approvals"&&e.render()}catch(g){alert(g.message)}}e.renderApprovals=$,e.decideApproval=S}function We(e){function $(){let S=e.state._tools||{},b=(S.tools||[]).map(s=>`<div class="tool-row">
      <div class="name">${e.esc(s.name)}${s.requires_approval?' <span class="badge-pill">approval</span>':""}</div>
      <div class="cat">${e.esc(s.category)}</div>
      <div class="desc">${e.esc(s.description)}</div></div>`).join("");return`<p class="body-md" style="margin-bottom:var(--space-xs);max-width:60ch">${S.total||0} tools \xB7 ${Object.keys(S.by_category||{}).length} categories. Tool-RAG retrieves the most relevant set per message.</p>
    <div class="tool-list">${b}</div>`}e.renderTools=$}function Me(e){function $(){let S=e.state._activity?.traces_full||[],b=e.state._activity?.actions||e.state.actions||[],s=S.length?S.map(p=>`
      <article class="trace-card">
        <div class="trace-card-head">
          <span class="mono">${e.esc(p.actor)}</span>
          <span class="muted">${p.duration_s}s</span>
        </div>
        <p class="message">${e.esc(p.message)}</p>
        ${e.renderLiveFlow(p.events,"No tools in this turn")}
        ${p.final?`<p class="world-meta" style="margin-top:var(--space-xs)">\u2192 ${e.esc(p.final)}</p>`:""}
      </article>`).join(""):"<p class='body-md muted'>No agent turns logged today. Send a message in Chat to see the decision flow here.</p>",g=b.slice(0,20).map(p=>`<div class="activity-row">
      <div class="mono">${e.esc(p.tool_name)}</div>
      <div class="meta">${e.esc(p.actor)} \xB7 ${e.esc((p.created_at||"").slice(0,16))}</div></div>`).join("")||"<p class='muted'>No actions logged.</p>";return`<div class="dashboard-grid">
      <section class="driver-card span-8"><p class="caption-uppercase">Decision flow</p><div style="margin-top:var(--space-sm)">${s}</div></section>
      <section class="driver-card span-4"><p class="caption-uppercase">Tool log</p><div style="margin-top:var(--space-sm)">${g}</div></section>
    </div>`}e.renderActivity=$}function Ve(e){function $(){let r=e.state._infraHealth;if(!r)return`<section class="driver-card span-12">
        <div class="infra-health-head">
          <p class="caption-uppercase">Infrastructure</p>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Check health</button>
        </div>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Monitor EC2 host, S3 vault bucket, and disk on this server.</p>
      </section>`;let a=r.host||{},n=r.s3||{},u=r.disk||{},i=r.app||{},f=a.platform==="ec2"?e.infraKvRow("Instance",a.instance_id,!0)+e.infraKvRow("Region",a.region)+e.infraKvRow("Type",a.instance_type)+e.infraKvRow("IAM role",a.iam_role):e.infraKvRow("Host","Local / dev"),O=n.configured?e.infraKvRow("Bucket",n.bucket,!0)+e.infraKvRow("Region",n.region)+e.infraKvRow("Read/write",n.read_write_ok?"OK":n.reachable?"Reachable only":"Failed"):e.infraKvRow("Storage","Local disk only"),I=e.infraKvRow("Data path",u.path,!0)+e.infraKvRow("Free",u.free_gb!=null?`${u.free_gb} GB`:null)+e.infraKvRow("Used",u.used_pct!=null?`${u.used_pct}%`:null),y=!!r.ok;return`<section class="driver-card span-12">
      <div class="infra-health-head">
        <div>
          <p class="caption-uppercase">Infrastructure</p>
          <p class="world-meta">Last checked ${e.esc(e.fmtTime(r.checked_at)||r.checked_at||"\u2014")} \xB7 App storage: <strong>${e.esc(i.storage_backend||"\u2014")}</strong></p>
        </div>
        <div class="infra-health-head__actions">
          <span class="badge-pill${y?" badge-pill--ok":" badge-pill--warn"}">${y?"All checks passed":"Needs attention"}</span>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Refresh</button>
        </div>
      </div>
      <div class="infra-health-grid">
        ${e.infraHealthCard("EC2 host",a.ok!==!1,f,a.detail)}
        ${e.infraHealthCard("S3 vault",n.configured?!!n.ok:!0,O,n.detail)}
        ${e.infraHealthCard("Disk",!!u.ok,I,u.detail)}
      </div>
    </section>`}function S(){let r=e.state.config||{},a=r.integrations||{},n=e.state._whatsapp||{},u=(r.autonomy_level||"balanced").toLowerCase(),i=r.whatsapp_enabled?n.connected?`Connected${n.linked_phone?` (${e.esc(n.linked_phone)})`:""}`:n.qr_pending?"Scan QR below":"Bridge not connected":"Disabled in .env",f=n.qr_data_url?`<img src="${n.qr_data_url}" alt="WhatsApp QR code" width="280" height="280" style="margin-top:var(--space-sm);border-radius:8px">`:"",O=r.agent_paused?'<button type="button" class="button-primary" id="toggle-pause">Resume agent</button>':'<button type="button" class="button-outline-on-dark" id="toggle-pause">Pause agent</button>';return`<div class="dashboard-grid settings-page">
      ${e.renderInfrastructureHealth()}
      <section class="driver-card span-4 settings-panel">
        <p class="caption-uppercase">Identity</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Name</dt><dd>${e.esc(r.my_name)}</dd></div>
          <div class="settings-kv__row"><dt>Company</dt><dd>${e.esc(r.company_name)}</dd></div>
        </dl>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Edit identity in <code>.env</code> \u2014 restart to persist.</p>
      </section>
      <section class="driver-card span-8 human-panel">
        <p class="section-eyebrow">Your policy</p>
        <h3 class="title-sm">Agent behavior</h3>
        <p class="body-md muted" style="margin-bottom:var(--space-sm)">You set how much the agent can do without asking. Changes apply for this session.</p>
        <form class="human-form" id="agent-config-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Autonomy</span>
              <select class="text-input-on-dark" name="autonomy_level">
                <option value="cautious"${u==="cautious"?" selected":""}>Cautious \u2014 ask before most actions</option>
                <option value="balanced"${u==="balanced"?" selected":""}>Balanced \u2014 routine tools auto-run</option>
                <option value="autonomous"${u==="autonomous"?" selected":""}>Autonomous \u2014 minimal prompts</option>
              </select></label>
            <label class="human-field human-field--checkbox">
              <input type="checkbox" name="auto_approve" value="1"${r.auto_approve?" checked":""}>
              <span>Auto-approve low-risk tool calls</span>
            </label>
          </div>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save policy</button>
            ${O}
          </div>
        </form>
      </section>
      <section class="driver-card span-4 settings-panel">
        <p class="caption-uppercase">Channels</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Web UI</dt><dd>${r.web_ui_enabled?"On":"Off"}</dd></div>
          <div class="settings-kv__row"><dt>Telegram</dt><dd>${r.telegram_enabled?"On":"Off"}</dd></div>
          <div class="settings-kv__row"><dt>Port</dt><dd>${r.dashboard_port}</dd></div>
        </dl>
      </section>
      <section class="driver-card span-4">
        <p class="caption-uppercase">Access</p>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Lock this dashboard on shared or production hosts with a 6-digit PIN (<code>DASHBOARD_PIN</code> in <code>.env</code>).</p>
        <div class="human-form__actions" style="margin-top:var(--space-sm)">
          <button type="button" class="button-outline-on-dark button-sm" id="btn-logout">Lock dashboard</button>
        </div>
      </section>
      <section class="driver-card span-8">
        <p class="caption-uppercase">Integrations</p>
        <div class="integration-grid" style="margin-top:var(--space-sm)">
          ${e.integrationCard("Gmail",a.gmail,"SMTP send + IMAP inbox via app password")}
          ${e.integrationCard("Google Calendar",a.calendar,"OAuth token in data/google_token.json")}
          ${e.integrationCard("Qdrant",a.qdrant,"Vector memory + knowledge vault")}
          ${e.integrationCard("X / Twitter",a.x,"Posting and monitoring API keys")}
          ${e.integrationCard("Serper",a.serper,"Web search")}
          ${e.integrationCard("Tavily",a.tavily,"Research search")}
          ${e.integrationCard("GitHub",a.github||a.github_oauth,a.github?"Connected \u2014 link repos in Worlds":a.github_oauth?"OAuth ready \u2014 connect in Worlds":"Set GITHUB_CLIENT_ID in .env")}
          ${e.integrationCard("WhatsApp",a.whatsapp&&n.connected,"Allowlisted CRM contacts only; every send needs approval")}
        </div>
      </section>
      ${r.whatsapp_enabled?`<section class="driver-card span-12 human-panel" id="whatsapp-settings-panel">
        <p class="section-eyebrow">WhatsApp</p>
        <h3 class="title-sm">Linked device</h3>
        <p class="body-md muted">Personal WhatsApp via Baileys (unofficial). Only contacts you allow in CRM are stored or messaged. Outbound always requires your approval.</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Status</dt><dd>${i}</dd></div>
          <div class="settings-kv__row"><dt>Allowlisted</dt><dd>${n.allowlist_count??n.allowlist_size??"\u2014"} contacts</dd></div>
        </dl>
        ${f}
        <p class="caption muted" style="margin-top:var(--space-xs)">Open WhatsApp \u2192 Linked devices \u2192 Link a device. QR refreshes every few seconds while pending.</p>
      </section>`:""}
    </div>`}function b(){e.whatsappPollTimer&&(clearInterval(e.whatsappPollTimer),e.whatsappPollTimer=null)}async function s(){if(e.currentView!=="settings"){e.stopWhatsappPoll();return}try{let r=await e.api("/whatsapp/status");if(e.state._whatsapp={...e.state._whatsapp||{},...r},r.qr_pending){let a=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=a.qr_data_url||null}else e.state._whatsapp.qr_data_url=null;e.currentView==="settings"&&e.render({graphs:!1})}catch{}}function g(){e.stopWhatsappPoll();let r=e.state.config||{};e.currentView!=="settings"||!r.whatsapp_enabled||(e.pollWhatsappSettings(),e.whatsappPollTimer=setInterval(s,5e3))}async function p(){let r=document.getElementById("btn-infra-refresh");r&&(r.disabled=!0);try{e.state._infraHealth=await e.api("/infrastructure/health"),e.render(),e.afterRender()}catch(a){console.error("Infrastructure health check failed:",a)}finally{r&&(r.disabled=!1)}}async function h(r){let a=new FormData(r);try{let n=await e.api("/agent/config",{method:"POST",body:JSON.stringify({autonomy_level:(a.get("autonomy_level")||"balanced").toString(),auto_approve:a.get("auto_approve")==="1"})});e.state.config={...e.state.config||{},...n},e.updateStatus(),e.render()}catch(n){alert(n.message)}}e.renderInfrastructureHealth=$,e.renderSettings=S,e.stopWhatsappPoll=b,e.pollWhatsappSettings=s,e.startWhatsappPollIfNeeded=g,e.refreshInfraHealth=p,e.saveAgentConfig=h}function Fe(e){function $(y){let w={name:"",dirs:{},files:[]};for(let A of y){let L=A.github_path||A.filename||A.title||"file",M=L.split("/").filter(Boolean),j=M.pop()||L,U=w;for(let Q of M)U.dirs[Q]||(U.dirs[Q]={name:Q,dirs:{},files:[]}),U=U.dirs[Q];U.files.push({...A,_fileName:j})}return w}function S(){return document.hidden?e.LIVE_POLL_HIDDEN_MS:e.LIVE_POLL_MS}function b(){e.livePollTimer&&clearTimeout(e.livePollTimer),e.livePollTimer=setTimeout(async()=>{await e.pollLive(),e.scheduleLivePoll()},e.livePollDelayMs())}function s(y){return e.WORLD_KINDS[y]||e.WORLD_KINDS.project}function g(y){let w=e.worldKindMeta(y||"project");return`<span class="world-kind-badge ${w.cls}">${e.esc(w.label)}</span>`}function p(){return e.state._worldFull?.worlds||e.state.worlds||{}}function h(y){e.currentView==="world"&&e.inspectorWorldId()===y?e.patchWorldPanels():e.currentView==="agents"&&e.currentWorldId()===y?e.patchAgentsVaultPanel():e.render({graphs:!1})}function r(){return(e.state._worldVault?.storage_backend||e.state._worldVault?.vault?.storage_backend)==="s3"?"S3":"local object storage"}function a(y){let w=Number(y)||0;return w<1024?`${w} B`:w<1048576?`${(w/1024).toFixed(1)} KB`:`${(w/1048576).toFixed(1)} MB`}function n(y){if(!y)return"";let w=typeof y=="number"?new Date(y*1e3):new Date(y);return Number.isNaN(w.getTime())?String(y).slice(0,16):w.toLocaleString()}function u(y,w,A=!1){let L=w==null||w===""?"\u2014":String(w);return`<div class="infra-kv"><dt>${e.esc(y)}</dt><dd${A?' class="infra-kv__val"':""}>${e.esc(L)}</dd></div>`}function i(y,w,A,L){let M=w?"Healthy":"Issue";return`<div class="integration-card infra-health-card${w?" is-connected":" is-warning"}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(y)}</span>
        <span class="integration-card__status">${M}</span>
      </div>
      <dl class="infra-kv-list">${A}</dl>
      ${L?`<p class="integration-card__detail">${e.esc(L)}</p>`:""}
    </div>`}function f(y,w,A){return`<div class="integration-card${w?" is-connected":""}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(y)}</span>
        <span class="integration-card__status">${w?"Active":"Not configured"}</span>
      </div>
      <p class="integration-card__detail">${e.esc(A)}</p>
    </div>`}async function O(y){let w=y.target.files?.[0];if(!w)return;let A=new FormData;A.append("file",w),e.chatHistory.push({role:"user",text:`\u{1F4CE} Uploaded: ${w.name}`}),e.render();try{A.append("world_id",e.currentWorldId());let L=await fetch("/api/upload",{method:"POST",body:A,credentials:"same-origin"}),M=await L.json().catch(()=>({}));if(L.status===401&&M.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!L.ok)throw new Error(M.error||L.statusText);e.chatHistory.push({role:"agent",text:M.reply})}catch(L){e.chatHistory.push({role:"system",text:"Upload failed: "+L.message})}localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),y.target.value="",e.render()}function I(){let y=document.querySelector(".app"),w=e.$("#btn-sidebar-collapse"),A="fos_sidebar_collapsed";localStorage.getItem(A)==="1"&&y?.classList.add("sidebar-collapsed");let L=()=>{let M=y?.classList.contains("sidebar-collapsed");w?.setAttribute("aria-label",M?"Expand sidebar":"Collapse sidebar"),w?.setAttribute("title",M?"Expand sidebar":"Collapse sidebar")};L(),w?.addEventListener("click",()=>{y?.classList.toggle("sidebar-collapsed"),localStorage.setItem(A,y?.classList.contains("sidebar-collapsed")?"1":"0"),L()})}e.buildGithubPathTree=$,e.livePollDelayMs=S,e.scheduleLivePoll=b,e.worldKindMeta=s,e.worldKindBadge=g,e.worldTreeData=p,e.afterVaultMutation=h,e.vaultStorageLabel=r,e.formatBytes=a,e.fmtHistoryTime=n,e.infraKvRow=u,e.infraHealthCard=i,e.integrationCard=f,e.uploadFile=O,e.initSidebarCollapse=I}function Ge(e){async function $(g){if(g==="crm"&&await e.loadCrmData(),g==="outreach"&&await e.loadOutreachData(),g==="settings"&&(e.state._whatsapp=await e.api("/whatsapp/status").catch(()=>({})),e.state._whatsapp.qr_pending)){let p=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=p.qr_data_url||null}if(g==="goals"&&(e.state._goals=await e.api("/goals")),g==="tools"&&(e.state._tools=await e.api("/tools")),g==="agents"){let[p,h,r,a,n]=await Promise.all([e.api("/agents"),e.api("/activity").catch(()=>({})),e.api("/agents/runs").catch(()=>({runs:[],actions:[]})),e.api("/crm/contacts").catch(()=>({})),e.api("/tools").catch(()=>({}))]);e.state._agents=p,e.state._agents?.specialists?.length||(e.state._agents={...e.state._agents,specialists:e.DEFAULT_SPECIALISTS}),e.state._activity=h,e.state._agentRunsApi=r.runs||[],e.state._agentActions=r.actions||h.actions||[],e.state._crm=a,e.state._tools=n;let u=e.currentWorldId();u&&u!=="root"?await e.ensureVaultForWorld(u):e.clearVaultScopedState()}if(g==="settings"&&(e.state._infraHealth=await e.api("/infrastructure/health").catch(()=>e.state._infraHealth||null)),g==="activity"&&(e.state._activity=await e.api("/activity")),g==="history"){let p=e.currentWorldId(),h=p&&p!=="root"?`?world_id=${encodeURIComponent(p)}`:"";e.state._history=await e.api(`/history${h}`).catch(()=>({sessions:[],recent_runs:[]})),e.state._artifacts=(await e.api(`/artifacts${h}`).catch(()=>({artifacts:[]}))).artifacts||[],e.state._historySelectedId?e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null):e.state._history.sessions?.[0]&&(e.state._historySelectedId=e.state._history.sessions[0].id,e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null))}if(g==="documents")if(e.state._artifacts=(await e.api("/artifacts?limit=100").catch(()=>({artifacts:[]}))).artifacts||[],e.state._documentsSelectedId)try{let p=await e.api(`/artifacts/${e.state._documentsSelectedId}/content`,{timeoutMs:15e3});e.state._documentDraft=p.content||""}catch{e.state._documentDraft=""}else e.state._documentDraft="";if(g==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldGraph=e.state._worldFull?.graph??null,e.state._worldHierarchyGraph=e.state._worldFull?.hierarchy_graph??null,e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.invalidateGraphCache("graph-world"),e.state._worldTemplates?.length||(e.state._worldTemplates=(await e.api("/world-templates").catch(()=>({}))).templates||[]),e.state.inspectorWorldId||(e.state.inspectorWorldId=e.currentWorldId()),e.state._githubStatus=await e.api("/github/status").catch(()=>({})),e.state._githubStatus?.connected?e.state._githubRepos=(await e.api("/github/repos").catch(()=>({}))).repos||[]:e.state._githubRepos=[],await e.ensureVaultForWorld(e.inspectorWorldId()),await e.resumeActiveSyncJobs(e.inspectorWorldId())),g==="memory"&&(e.state._memoryFull=await e.api("/graph/memory"),e.state._memoryGraph=e.state._memoryFull?.graph??null,e.invalidateGraphCache("graph-memory")),(g==="dashboard"||g==="chat"||g==="agents")&&(e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})))),g==="chat"){e.state._activity=await e.api("/activity").catch(()=>e.state._activity||{}),e.state._agentRunsApi=(await e.api("/agents/runs").catch(()=>({}))).runs||e.state._agentRunsApi,await e.loadChatSessionsList(),await e.loadChatFromServer();let p=e.currentWorldId();p&&p!=="root"&&await e.ensureVaultForWorld(p)}if(g==="dashboard"){e.state._world=await e.api("/world").catch(()=>e.state._world||{}),e.state._worldGraph=e.state._world?.graph??e.state._worldGraph??null,e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})));let p=e.currentWorldId(),h=p&&p!=="root"?`?world_id=${encodeURIComponent(p)}`:"";e.state._nudges=(await e.api(`/nudges${h}`).catch(()=>({nudges:[]}))).nudges||[]}["dashboard","agents","chat","world","memory"].includes(g)&&await e.loadGraphData()}async function S(g=!1){let p=e.state.activeWorldId,h=e.state.selectedSpecialist,r=e.state.ui;if(g||!e.state.config?.my_name)e.state={...e.state,...await e.api("/state")};else{let a=await e.api("/summary");e.state.usage=a.usage??e.state.usage,e.state.unread_notifications=a.unread_notifications??e.state.unread_notifications,a.worlds&&(e.state.worlds=a.worlds),a.config&&(e.state.config=a.config),e.state.snapshot={...e.state.snapshot||{},approvals_pending:a.approvals_pending??e.state.snapshot?.approvals_pending??0,reminders_pending:a.reminders_pending??e.state.snapshot?.reminders_pending??0,tasks_open:a.tasks_open??e.state.snapshot?.tasks_open??0,crm:{...e.state.snapshot?.crm||{},followups_due:a.crm_followups_due??e.state.snapshot?.crm?.followups_due??0}}}e.state.activeWorldId=p||e.state.activeWorldId||"root",e.state.selectedSpecialist=h??e.state.selectedSpecialist??"",e.state.ui=r||e.state.ui;try{e.populateWorldSelect(),e.populateSpecialistSelect()}catch(a){console.error("populate selects failed:",a)}e.updateBadges(),e.updateStatus(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function b(){}function s(){e.refreshTimer&&clearTimeout(e.refreshTimer),!document.hidden&&(e.refreshTimer=setTimeout(async()=>{try{await e.refresh(!1),e.updateBadges(),e.updateStatus()}catch(g){console.error(g),e.setConnectionStatus("Reconnecting\u2026","paused")}e.scheduleBackgroundRefresh()},e.REFRESH_MS))}e.loadViewData=$,e.refresh=S,e.loadBootExtras=b,e.scheduleBackgroundRefresh=s}function Ne(e){function $(){return window.FOS_MOBILE_PRIMARY_VIEWS||new Set(["dashboard","chat","agents","world"])}function S(){document.getElementById("sidebar")?.classList.remove("is-open"),document.body.classList.remove("mobile-nav-open");let i=document.getElementById("sidebar-backdrop");i&&(i.classList.remove("is-visible"),i.setAttribute("hidden","")),document.getElementById("mobile-menu-drawer")?.close?.()}function b(){let i=document.getElementById("sidebar"),f=document.getElementById("sidebar-backdrop");!i||!f||(i.classList.add("is-open"),document.body.classList.add("mobile-nav-open"),f.removeAttribute("hidden"),requestAnimationFrame(()=>f.classList.add("is-visible")))}function s(i){let f=e.mobilePrimaryViews();document.querySelectorAll(".mobile-tab").forEach(O=>{let I=O.dataset.mobileView;I==="more"?O.classList.toggle("is-active",!f.has(i)):O.classList.toggle("is-active",I===i)}),document.querySelectorAll(".mobile-menu-link").forEach(O=>{O.classList.toggle("is-active",O.dataset.view===i)})}function g(i,f={}){let O=f.params??(i===e.currentView?e.routeParams:{})??{};f.skipUrl?e.applyRouteParams(i,O):e.updateRoute(i,O,{replace:!!f.replace}),e.currentView=i,i!=="outreach"&&e.state._crmOutreachPollId&&(clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null),e.$$(".nav button").forEach(y=>y.classList.toggle("is-active",y.dataset.view===i)),e.$("#view-title").textContent=e.TITLES[i]||i,e.syncMobileNav(i),e.closeMobileShell(),FOSMotion?.animateTopbarTitle?.(),["dashboard","agents","chat","activity","world"].includes(i)?e.startLivePoll():e.stopLivePoll();let I=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1}),e.loadViewData(i).then(()=>{I===e.viewDataLoadGen&&(e.setViewLoading(!1),e.render())}).catch(y=>{console.error(y),I===e.viewDataLoadGen&&e.setViewLoading(!1)})}function p(i={}){try{e.currentView==="dashboard"&&e.drawDashboardCharts()}catch(y){console.warn("dashboard charts skipped:",y)}try{i.graphs!==!1&&e.drawGraphs()}catch(y){console.warn("graphs skipped:",y)}e.state._motionSkipOnce?e.state._motionSkipOnce=!1:FOSMotion?.runView?.(e.currentView),FOSMotion?.ensureContentVisible?.();let f=document.getElementById("content"),O=window.FOSMarkdown?.enhance?.(f),I=()=>{(e.currentView==="chat"||e.currentView==="agents")&&e.initMsgReadMore(f)};if(O?.then?O.then(I).catch(I):I(),e.currentView==="documents"&&!e.documentsEditMode){let y=e.$("#docs-preview");y&&window.FOSMarkdown?.renderInto?.(y,e.state._documentDraft??"")}e.startWhatsappPollIfNeeded(),e.currentView==="outreach"&&e.outreachStep?.()==="setup"&&(e.syncOutreachCompanyPickerUi?.(),e.fitAllOutreachTextareas?.()),e.currentView==="outreach"&&e.outreachStep?.()==="review"&&e.fitAllOutreachTextareas?.()}function h(){let i=(e.state.approvals||[]).length,f=e.$("#nav-approval-badge");f&&(f.textContent=i,f.hidden=!i);let O=e.$("#mobile-approval-badge");O&&(O.textContent=i,O.hidden=!i);let I=e.$("#mobile-menu-approval-badge");I&&(I.textContent=i,I.hidden=!i);let y=e.state.unread_notifications||0,w=e.$("#notif-badge");w&&(w.textContent=y,w.hidden=!y)}function r(i,f="ok"){let O=e.$("#status-dot"),I=e.$("#status-text"),y=e.$("#mobile-status-dot"),w=e.$("#mobile-status-text");I&&(I.textContent=i),w&&(w.textContent=i),O?.classList.toggle("ok",f==="ok"),O?.classList.toggle("paused",f!=="ok"),y?.classList.toggle("ok",f==="ok"),y?.classList.toggle("paused",f!=="ok")}function a(){let i=e.state.config||{};i.agent_paused?e.setConnectionStatus("Agent paused","paused"):e.setConnectionStatus("Online","ok");let f=e.$("#brand-sub");f&&(f.textContent=i.my_name||i.company_name||e.APP_NAME),document.title=i.my_name?`${e.APP_NAME} \u2014 ${i.my_name}`:e.APP_NAME}async function n(i,f){f&&(await e.api(`/notifications/${encodeURIComponent(f)}/read`,{method:"POST"}).catch(()=>{}),await e.refresh(),e.updateBadges()),i==="approvals"?e.goView("approvals"):i==="crm"?e.goView("crm"):i==="outreach"?e.goView("outreach"):i==="goals"?e.goView("goals"):i==="chat"?e.goView("chat"):e.goView(i||"dashboard"),e.$("#notif-drawer")?.close()}function u(){let i=e.state.notifications||[];e.$("#notif-list").innerHTML=i.length?i.map(f=>{let O=f.meta?.action||(f.kind==="approval"?"approvals":f.kind==="agent"?"chat":""),I=O?`<button type="button" class="button-outline-on-dark button-sm" data-notif-action="${e.esc(O)}" data-notif-id="${e.esc(f.id)}" style="margin-top:8px">Open</button>`:"",y=f.meta?.url,w=!I&&y?`<a class="button-outline-on-dark button-sm" href="${e.esc(y)}" target="_blank" rel="noopener" style="margin-top:8px;display:inline-block">Open</a>`:"";return`
      <div class="notif-item ${f.read?"":"unread"}" data-notif-id="${e.esc(f.id)}">
        <div class="title">${e.esc(f.title)}</div>
        <div class="body">${e.esc(f.body)}</div>
        <div class="muted" style="font-size:11px;margin-top:4px">${e.fmtTime(f.ts)}</div>
        ${I||w}
      </div>`}).join(""):"<p class='muted'>No notifications yet.</p>"}e.mobilePrimaryViews=$,e.closeMobileShell=S,e.openSidebar=b,e.syncMobileNav=s,e.goView=g,e.afterRender=p,e.updateBadges=h,e.setConnectionStatus=r,e.updateStatus=a,e.openNotificationAction=n,e.renderNotifications=u}function Be(e){function $(){let S=document.getElementById("content");!S||S.dataset.delegation==="1"||(S.dataset.delegation="1",S.addEventListener("click",b=>{let s=b.target.closest("[data-operator],[data-toggle-ui],[data-goto],[data-approve],[data-reject],[data-select-specialist],[data-agents-tab],[data-toggle-run],[data-memory-tab],[data-inspect-world],[data-world-graph-tab],[data-use-world],[data-set-active-world],[data-edit-world],[data-cancel-edit],[data-delete-world],[data-vault-ingest],[data-vault-link],[data-vault-search],[data-vault-facet],[data-vault-add-doc],[data-vault-cancel-doc],[data-vault-edit-doc],[data-vault-delete-doc],[data-vault-view-doc],[data-vault-reload],[data-github-add],[data-github-sync],[data-github-unlink],[data-goal-done],[data-history-tab],[data-history-session],[data-open-chat-session],[data-new-chat-session],[data-chat-session],[data-cancel-job],[data-cancel-active-job],[data-md-artifact],[data-open-document],[data-select-document],[data-docs-action],[data-tag-vault-doc],[data-nudge-index],[data-remove-attachment],[data-open-vault-picker],[data-pick-vault-doc],[data-crm-followup],[data-crm-wa-thread],[data-crm-tab],[data-crm-company-detail],[data-crm-company-close],[data-crm-import-companies],[data-crm-reload],[data-crm-outreach-start],[data-crm-campaign],[data-crm-draft-approve],[data-crm-draft-skip],[data-crm-company-toggle],[data-crm-skip-company],[data-crm-outreach-refresh],[data-crm-outreach-back],[data-outreach-open-crm-companies],[data-outreach-save-companies],[data-outreach-save-dossier],[data-outreach-ai-edit],[data-outreach-refresh-research],[data-outreach-refresh-research-web],[data-msg-read-more],#chat-send,#chat-clear,#memory-search,#toggle-pause,#agents-vault-search,#delegate-selected-btn,#btn-logout,#btn-infra-refresh");if(!s)return;let g=()=>{if(s.dataset.msgReadMore){e.state._msgExpand||(e.state._msgExpand={});let p=s.dataset.msgReadMore;e.state._msgExpand[p]=(e.state._msgExpand[p]||0)+1,e.initMsgReadMore(s.closest(".msg-read-more-host")||S);return}if(s.id==="chat-send")return e.sendChat();if(s.id==="chat-clear")return e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.setChatSessionId(null),e.render();if(s.id==="memory-search")return e.searchMemory();if(s.id==="toggle-pause")return e.togglePause();if(s.id==="agents-vault-search")return e.agentsVaultSearch();if(s.id==="delegate-selected-btn")return e.delegateAgent();if(s.id==="btn-logout")return e.logoutPin();if(s.id==="btn-infra-refresh")return e.refreshInfraHealth();if(s.dataset.operator)return e.openOperatorAction(s.dataset.operator);if(s.dataset.toggleUi)return e.state.ui||(e.state.ui={}),e.state.ui[s.dataset.toggleUi]=!e.state.ui[s.dataset.toggleUi],e.render();if(s.dataset.goto)return e.goView(s.dataset.goto);if(s.dataset.approve)return e.decideApproval(s.dataset.approve,!0);if(s.dataset.reject)return e.decideApproval(s.dataset.reject,!1);if(s.dataset.selectSpecialist!==void 0)return e.selectSpecialist(s.dataset.selectSpecialist||"");if(s.dataset.agentsTab){e.state.agentsTab=s.dataset.agentsTab,localStorage.setItem("fos_agents_tab",e.state.agentsTab),e.render(),e.state.agentsTab==="vault"?e.onWorldContextChanged({vaultWorldId:e.currentWorldId(),forceVault:!1}).then(()=>e.patchAgentsVaultPanel()):e.drawGraphs();return}if(s.dataset.toggleRun){let p=s.dataset.toggleRun;return e.state.expandedRunId=e.state.expandedRunId===p?null:p,e.render()}if(s.dataset.memoryTab)return e.memoryGraphTab=s.dataset.memoryTab,e.render({graphs:!1});if(s.dataset.inspectWorld)return e.selectInspectorWorld(s.dataset.inspectWorld);if(s.dataset.worldGraphTab)return e.switchWorldGraphTab(s.dataset.worldGraphTab);if(s.dataset.useWorld)return e.setActiveWorld(s.dataset.useWorld),e.goView("chat");if(s.dataset.setActiveWorld)return e.setActiveWorld(s.dataset.setActiveWorld),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.onWorldContextChanged({vaultWorldId:s.dataset.setActiveWorld,forceVault:!0}).then(()=>e.currentView==="world"?e.patchWorldPanels():e.render({graphs:!1}));if(s.dataset.editWorld)return e.state.worldEditing=s.dataset.editWorld,e.render();if(s.dataset.cancelEdit!==void 0)return e.state.worldEditing=null,e.render();if(s.dataset.deleteWorld)return e.deleteWorld(s.dataset.deleteWorld);if(s.dataset.vaultIngest)return e.vaultIngest(s.dataset.vaultIngest);if(s.dataset.vaultLink)return e.vaultLinkRepo(s.dataset.vaultLink);if(s.dataset.vaultSearch)return e.vaultSearch(s.dataset.vaultSearch);if(s.dataset.vaultReload)return e.reloadVaultFromServer(s.dataset.vaultReload);if(s.dataset.vaultFacet)return e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=s.dataset.vaultFacet,e.patchWorldPanels();if(s.dataset.vaultAddDoc!==void 0)return e.state.ui||(e.state.ui={}),e.state.ui.vaultDocForm=!0,e.state.ui.vaultDocEdit=null,e.patchWorldPanels();if(s.dataset.vaultCancelDoc!==void 0)return e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),e.patchWorldPanels();if(s.dataset.vaultEditDoc)return e.startVaultDocEdit(e.inspectorWorldId(),s.dataset.vaultEditDoc);if(s.dataset.vaultViewDoc){let p=s.dataset.worldId||e.inspectorWorldId(),h=s.dataset.vaultViewDoc;return h?e.openVaultDocViewer(p,h,s.dataset.docTitle||"Document"):void 0}if(s.dataset.tagVaultDoc)return e.tagVaultDocInChat(s.dataset.tagVaultDoc,s.dataset.worldId,s.dataset.docTitle,s.dataset.docPath);if(s.dataset.nudgeIndex!==void 0)return e.handleNudgeAction(s.dataset.nudgeIndex);if(s.dataset.removeAttachment!==void 0){let p=Number(s.dataset.removeAttachment);return Number.isNaN(p)||e.state._chatAttachments?.splice(p,1),e.render()}if(s.dataset.openVaultPicker!==void 0)return e.openVaultAttachPicker().catch(p=>alert(p.message));if(s.dataset.pickVaultDoc){e.tagVaultDocInChat(s.dataset.pickVaultDoc,s.dataset.worldId,s.dataset.docTitle,s.dataset.docPath),e.$("#vault-picker-dialog")?.close();return}if(s.dataset.crmTab)return e.state.ui||(e.state.ui={}),e.state.ui.crmTab=s.dataset.crmTab,localStorage.setItem("fos_crm_tab",e.state.ui.crmTab),e.loadCrmData().then(()=>e.render());if(s.dataset.crmOutreachRefresh!==void 0){let p=e.state.ui?.crmCampaignId;return p?e.pollCrmOutreachJob(p,!0):e.loadOutreachData().then(()=>e.render())}if(s.hasAttribute("data-outreach-save-companies"))return e.saveOutreachCompanySelection();if(s.dataset.outreachSaveDossier)return e.runWithActionBusy(()=>e.saveOutreachDossier(s.dataset.outreachSaveDossier),s);if(s.dataset.outreachAiEdit){let p=document.querySelector(`[data-outreach-ai-web="${s.dataset.outreachAiEdit}"]`)?.checked;return e.runWithActionBusy(()=>e.aiEditOutreachDraft(s.dataset.outreachAiEdit,p),s)}if(s.dataset.outreachRefreshResearch)return e.runWithActionBusy(()=>e.refreshOutreachResearch(s.dataset.outreachRefreshResearch,!1),s);if(s.dataset.outreachRefreshResearchWeb)return e.runWithActionBusy(()=>e.refreshOutreachResearch(s.dataset.outreachRefreshResearchWeb,!0),s);if(s.hasAttribute("data-outreach-open-crm-companies"))return e.state.ui||(e.state.ui={}),e.state.ui.crmTab="companies",localStorage.setItem("fos_crm_tab","companies"),e.goView("crm");if(s.dataset.crmCompanyDetail)return e.openCrmCompanyDetail(s.dataset.crmCompanyDetail);if(s.dataset.crmCompanyClose!==void 0)return e.state.ui&&(e.state.ui.crmCompanyDetail=null),e.state._crmCompanyDetail=null,e.render();if(s.dataset.crmImportCompanies!==void 0)return e.importCrmCompaniesFromContacts();if(s.dataset.crmReload!==void 0)return e.loadCrmData().then(()=>e.render());if(s.dataset.crmFollowup)return e.scheduleCrmFollowup(s.dataset.crmFollowup,s.dataset.followupDays);if(s.dataset.crmWaThread)return e.loadCrmWaThread(s.dataset.crmWaThread);if(s.dataset.crmCampaign)return e.openCrmCampaignReview(s.dataset.crmCampaign);if(s.hasAttribute("data-crm-outreach-back"))return e.closeCrmCampaignReview();if(s.dataset.crmDraftApprove)return e.runWithActionBusy(()=>e.approveCrmDraft(s.dataset.crmDraftApprove),s);if(s.dataset.crmDraftSkip)return e.runWithActionBusy(()=>e.skipCrmDraft(s.dataset.crmDraftSkip),s);if(s.dataset.crmSkipCompany)return confirm("Skip all pending messages for this company?")?e.runWithActionBusy(()=>e.skipCrmCompany(s.dataset.crmSkipCompany),s):void 0;if(s.dataset.reminderDone)return e.updateReminderStatus(s.dataset.reminderDone,"done");if(s.dataset.reminderCancel)return e.updateReminderStatus(s.dataset.reminderCancel,"cancelled");if(s.dataset.notifAction)return e.openNotificationAction(s.dataset.notifAction,s.dataset.notifId);if(s.dataset.vaultDeleteDoc)return e.deleteVaultDoc(e.inspectorWorldId(),s.dataset.vaultDeleteDoc);if(s.dataset.githubAdd)return e.connectGithubRepo(s.dataset.githubAdd);if(s.dataset.githubSync)return e.syncGithubRepo(s.dataset.worldId,s.dataset.githubSync);if(s.dataset.githubUnlink)return e.unlinkGithubRepo(s.dataset.worldId,s.dataset.githubUnlink);if(s.dataset.goalDone)return e.markGoalDone(s.dataset.goalDone);if(s.dataset.historyTab)return e.historyTab=s.dataset.historyTab,localStorage.setItem("fos_history_tab",e.historyTab),e.render();if(s.dataset.historySession)return e.loadHistorySession(s.dataset.historySession);if(s.dataset.openChatSession)return e.setChatSessionId(s.dataset.openChatSession),e.loadChatFromServer().then(()=>e.goView("chat"));if(s.hasAttribute("data-new-chat-session"))return e.setChatSessionId(null),e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.loadChatSessionsList().then(()=>{e.currentView==="chat"?e.render():e.goView("chat")});if(s.dataset.chatSession)return e.setChatSessionId(s.dataset.chatSession),e.loadChatFromServer().then(()=>e.render());if(s.dataset.cancelJob)return e.cancelActiveJob(s.dataset.cancelJob);if(s.dataset.cancelActiveJob!==void 0)return e.cancelActiveJob();if(s.dataset.openDocument)return e.openDocumentsWorkspace(Number(s.dataset.openDocument));if(s.dataset.mdArtifact)return e.openDocumentsWorkspace(Number(s.dataset.mdArtifact));if(s.dataset.selectDocument)return e.selectDocument(s.dataset.selectDocument);if(s.dataset.docsAction){let p=s.dataset.docsAction;if(p==="new")return e.createNewDocument().catch(h=>alert(h.message));if(p==="toggle")return e.documentsEditMode&&(e.state._documentDraft=document.getElementById("docs-source")?.value??e.state._documentDraft),e.documentsEditMode=!e.documentsEditMode,e.render();if(p==="save")return e.saveCurrentDocument().catch(h=>alert(h.message));if(p==="memory")return e.saveDocumentToMemory().catch(h=>alert(h.message))}};return e.shouldSkipActionBusy(s)?g():e.runWithActionBusy(g,s)}),S.addEventListener("submit",b=>{let s=b.target;if(!(s instanceof HTMLFormElement))return;let g={"world-create-form":e.createWorldFromForm,"crm-create-form":e.submitCrmContact,"crm-company-form":e.submitCrmCompany,"crm-outreach-form":e.submitCrmOutreach,"goal-create-form":e.submitGoal,"reminder-create-form":e.submitReminder,"agent-config-form":e.saveAgentConfig,"world-edit-form":e.saveWorldEdit,"vault-doc-form":e.submitVaultDoc};if(g[s.id]){b.preventDefault();let p=s.querySelector('[type="submit"]');e.runWithActionBusy(()=>g[s.id](s),p)}}),S.addEventListener("change",b=>{if(b.target.id==="chat-file")return e.uploadFile(b);if(b.target.id==="docs-upload"){let s=b.target.files?.[0];s&&e.uploadDocumentFile(s).catch(g=>alert(g.message)),b.target.value="";return}if(b.target.id==="specialist-select-agents"||b.target.id==="chat-specialist-select")return e.selectSpecialist(b.target.value);if(b.target.id==="rag-mode-select"){e.state.ragMode=b.target.value||"auto",localStorage.setItem("fos_rag_mode",e.state.ragMode);return}b.target.matches("[data-crm-status]")&&e.updateCrmStatus(b.target.dataset.crmStatus,b.target.value),b.target.matches("[data-crm-whatsapp]")&&e.updateCrmWhatsapp(b.target.dataset.crmWhatsapp,b.target.checked),b.target.matches("[data-crm-company-toggle]")&&e.toggleOutreachDraftCompany(b.target),b.target.id==="crm-outreach-batch"&&e.setOutreachBatchSize(b.target.value),b.target.id==="crm-outreach-world"&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld=b.target.value,e.restoreOutreachSelectionForWorld(b.target.value),e.loadOutreachData().then(()=>e.render()))}),S.addEventListener("blur",b=>{if(b.target.matches(".crm-draft-subject, .crm-draft-body")){let s=b.target.dataset.draftId;s&&e.saveCrmDraftEdits(s).catch(()=>{})}},!0),S.addEventListener("keydown",b=>{b.target.id==="chat-input"&&b.key==="Enter"&&!b.shiftKey&&(b.preventDefault(),e.sendChat()),b.target.id==="memory-q"&&b.key==="Enter"&&e.searchMemory()}),S.addEventListener("input",b=>{if(b.target.id==="outreach-company-search"&&e.filterOutreachCompanyList(b.target.value),b.target.matches(".crm-draft-body--fit, .outreach-auto-textarea")&&e.fitOutreachTextarea?.(b.target),b.target.matches(".crm-draft-body[data-channel='whatsapp']")){let s=b.target.dataset.draftId,g=document.querySelector(`.crm-wa-count[data-draft-id="${s}"]`);g&&(g.textContent=`${b.target.value.length}/300`)}b.target.id==="delegate-selected"&&(e.state._delegateDraft=b.target.value)}))}e.initContentDelegation=$}function je(e){function $(s="rag-mode-select"){let g=e.RAG_MODES.map(p=>`<option value="${e.esc(p.id)}" title="${e.esc(p.hint)}">${e.esc(p.label)}</option>`).join("");return`<label class="chat-control">
      <span class="caption-uppercase">Retrieval</span>
      <select id="${e.esc(s)}" class="world-select agent-select" aria-label="RAG mode">${g}</select>
    </label>`}function S(){requestAnimationFrame(()=>{let s=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),g=s?.[s.length-1];FOSMotion?.animateNewMessage?.(g)})}function b(s={}){let g=e.$("#content");if(!g)return;let p={dashboard:e.renderDashboard,chat:e.renderChat,agents:e.renderAgents,world:e.renderWorld,approvals:e.renderApprovals,crm:e.renderCrm,outreach:e.renderOutreach,goals:e.renderGoals,memory:e.renderMemory,history:e.renderHistory,documents:e.renderDocuments,tools:e.renderTools,activity:e.renderActivity,settings:e.renderSettings};try{if(e.state._viewLoading)g.innerHTML=e.renderViewSkeleton(e.currentView);else{let r=p[e.currentView]||e.renderDashboard;g.innerHTML=r()}}catch(r){console.error("render failed:",r),g.innerHTML=`<div class="driver-card span-12">
        <p class="title-md">Dashboard could not render</p>
        <p class="body-md muted" style="margin-top:8px">${e.esc(r?.message||String(r))}</p>
        <button type="button" class="button-primary button-sm" id="render-retry" style="margin-top:12px">Retry</button>
      </div>`,e.$("#render-retry")?.addEventListener("click",()=>e.boot());return}document.querySelector(".content")?.classList.toggle("content--worlds",e.currentView==="world"),document.querySelector(".content")?.classList.toggle("content--wide",["agents","world","activity","chat","history","documents"].includes(e.currentView)),document.querySelector(".content")?.classList.toggle("content--chat",e.currentView==="chat"),e.populateSpecialistSelect();let h=e.$("#rag-mode-select");if(h&&(h.value=e.state.ragMode||"auto"),s.post!==!1&&(e.afterRender({graphs:s.graphs!==!1}),e.state._scrollWorldCreate&&e.currentView==="world"&&(e.state._scrollWorldCreate=!1,requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"})))),e.currentView==="chat"){let r=e.$("#chat-messages");r&&(r.scrollTop=r.scrollHeight)}}e.renderRagModeSelect=$,e.animateLatestChatMessage=S,e.render=b}function He(e){function $(a){console.error(`${e.APP_NAME} boot failed:`,a),e.setConnectionStatus("Offline","paused");let n=e.esc(a?.message||String(a));e.$("#content").innerHTML=`<div class="driver-card span-12">
      <p class="title-md">Could not connect to ${e.esc(e.APP_NAME)}</p>
      <p class="body-md muted" style="margin-top:8px">${n}</p>
      <p class="body-md muted" style="margin-top:12px">Make sure <code>python main.py</code> is running, then tap <strong>Refresh</strong> in the top bar.</p>
    </div>`}function S(a,n){let u=e.$("#pin-gate"),i=document.querySelector(".app"),f=e.$("#pin-error"),O=e.$("#pin-input");u&&(u.hidden=!1,u.classList.add("is-visible")),i&&i.setAttribute("inert",""),f&&(a?(f.textContent=a,f.hidden=!1):(f.hidden=!0,f.textContent="")),O&&!n&&(O.disabled=!1,O.focus()),O&&n&&(O.disabled=!0,f&&(f.textContent=`Too many attempts. Wait ${n}s.`,f.hidden=!1)),e.setConnectionStatus("Locked","paused")}function b(){let a=e.$("#pin-gate"),n=document.querySelector(".app");a&&(a.hidden=!0,a.classList.remove("is-visible")),n&&n.removeAttribute("inert")}async function s(){return(await fetch("/api/auth/status",{credentials:"same-origin",headers:{Accept:"application/json"}})).json()}function g(){window.__FOS_PIN_BOUND||(window.__FOS_PIN_BOUND=!0,e.$("#pin-form")?.addEventListener("submit",async a=>{a.preventDefault();let n=(e.$("#pin-input")?.value||"").trim(),u=e.$("#pin-error");if(!/^\d{6}$/.test(n)){u&&(u.textContent="Enter exactly 6 digits",u.hidden=!1);return}try{let i=await fetch("/api/auth/pin",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:n})}),f=await i.json().catch(()=>({}));if(!i.ok)throw new Error(f.error||"Incorrect PIN");e.hidePinGate(),e.$("#pin-input").value="",u&&(u.hidden=!0),await e.startApp()}catch(i){u&&(u.textContent=i.message,u.hidden=!1);let f=await e.fetchAuthStatus().catch(()=>({}));f.locked_seconds&&e.showPinGate(i.message,f.locked_seconds)}}),e.$("#pin-input")?.addEventListener("input",a=>{a.target.value=a.target.value.replace(/\D/g,"").slice(0,6)}))}function p(){e.resolveBootRoute();let a=new URLSearchParams(location.search),n=a.get("world");n&&(e.state.inspectorWorldId=n,e.setActiveWorld(n));let u=a.get("companies");if(u&&e.currentView==="outreach"){let i=u.split(",").map(f=>parseInt(f.trim(),10)).filter(Boolean);i.length&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=i),a.delete("companies")}if(a.get("github")==="connected"||a.get("github_error")){let i=a.get("github_error");i&&console.warn("GitHub auth:",i),a.delete("github"),a.delete("github_error");let f=location.pathname||"/",O=a.toString();history.replaceState({},"",f+(O?`?${O}`:""))}}async function h(){e.applyBootUrlParams(),e.$$(".nav button").forEach(n=>n.classList.toggle("is-active",n.dataset.view===e.currentView)),e.$("#view-title").textContent=e.TITLES[e.currentView]||e.currentView,e.syncMobileNav(e.currentView);try{await e.refresh(!0)}catch(n){e.showBootError(n);return}let a=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1});try{if(await e.loadViewData(e.currentView),a!==e.viewDataLoadGen)return;e.setViewLoading(!1),e.render()}catch(n){console.error(n),a===e.viewDataLoadGen&&e.setViewLoading(!1)}e.startLivePoll(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function r(){e.initContentDelegation(),e.initMdEditorDialog(),e.bindPinGate();let a=window.__FOS_AUTH;if(!a)try{a=await e.fetchAuthStatus()}catch(n){e.showBootError(n);return}if(a.pin_required&&!a.authenticated){e.showPinGate(null,a.locked_seconds||0);return}e.hidePinGate(),await e.startApp()}e.showBootError=$,e.showPinGate=S,e.hidePinGate=b,e.fetchAuthStatus=s,e.bindPinGate=g,e.applyBootUrlParams=p,e.startApp=h,e.boot=r}var ue={dashboard:"/",chat:"/ask",agents:"/agents",world:"/worlds",crm:"/crm",outreach:"/outreach",goals:"/goals",memory:"/memory",documents:"/documents",history:"/history",approvals:"/approvals",tools:"/tools",activity:"/activity",settings:"/settings"},Ue=new Set(Object.keys(ue)),qe={"/chat":"chat","/control":"dashboard","/dashboard":"dashboard"},Je=Object.fromEntries(Object.entries(ue).map(([e,$])=>[e,$]));function vt(e){return!e||e==="/"?"/":e.replace(/\/+$/,"")||"/"}function ce(e){let $=vt(e),S=$.match(/^\/outreach\/campaigns\/(\d+)(?:\/review)?$/);if(S)return{view:"outreach",params:{campaignId:parseInt(S[1],10)}};if($==="/outreach")return{view:"outreach",params:{}};if(qe[$]){let b=qe[$];return{view:b,params:{},redirect:Je[b]}}for(let[b,s]of Object.entries(ue))if(s===$)return{view:b,params:{}};return{view:"dashboard",params:{},redirect:"/"}}function de(e,$={}){return e==="outreach"&&$.campaignId?`/outreach/campaigns/${$.campaignId}`:Je[e]||"/"}function ze(e){let $=!1;function S(r,a={}){e.routeParams={...a},r==="outreach"&&(e.state.ui||(e.state.ui={}),a.campaignId?e.state.ui.crmCampaignId=a.campaignId:(a.campaignId===null||a.campaignId===void 0)&&(a.keepCampaign||(e.state.ui.crmCampaignId=null)),a.companies?.length&&(e.state.ui.crmOutreachSelected=a.companies.map(Number).filter(Boolean)))}function b(r,a={},{replace:n=!1}={}){Ue.has(r)||(r="dashboard");let u=de(r,a),i=window.location.search||"",f=u+i,O=window.location.pathname+i;if(f!==O){let I={view:r,params:a};n?window.history.replaceState(I,"",f):window.history.pushState(I,"",f)}S(r,a)}function s({replace:r=!1}={}){let a=ce(window.location.pathname);if(a.redirect){let n=window.location.search||"";window.history.replaceState({view:a.view,params:a.params},"",a.redirect+n)}return S(a.view,a.params),e.currentView=a.view,a}function g(){return localStorage.getItem("fos_crm_tab")==="outreach"?(localStorage.removeItem("fos_crm_tab"),{view:"outreach",params:{}}):null}function p(){let r=new URLSearchParams(window.location.search),a=r.get("view");if(a&&Ue.has(a)){r.delete("view");let u=de(a,{}),i=r.toString(),f=u+(i?`?${i}`:"");return window.history.replaceState({view:a,params:{}},"",f),S(a,{}),e.currentView=a,{view:a,params:{}}}let n=g();if(n&&window.location.pathname==="/"){let u=window.location.search||"";return window.history.replaceState(n,"",de(n.view,n.params)+u),S(n.view,n.params),e.currentView=n.view,n}return s({replace:!0})}function h(){window.addEventListener("popstate",()=>{if($)return;let r=ce(window.location.pathname);S(r.view,r.params),e.goView(r.view,{skipUrl:!0,params:r.params,fromPopstate:!0})})}e.routeParams={},e.pathToRoute=ce,e.routeToPath=de,e.updateRoute=b,e.syncRouteFromLocation=s,e.resolveBootRoute=p,e.applyRouteParams=S,e.initRouter=h,e._routerSuppressPopstate=r=>{$=r}}function Ke(e){e.$$(".nav button").forEach(h=>h.addEventListener("click",()=>e.goView(h.dataset.view))),e.$("#btn-sidebar-open")?.addEventListener("click",e.openSidebar);let $=document.querySelector(".app"),S=e.$("#btn-sidebar-collapse"),b="fos_sidebar_collapsed";localStorage.getItem(b)==="1"&&$?.classList.add("sidebar-collapsed");let s=()=>{let h=$?.classList.contains("sidebar-collapsed");S?.setAttribute("aria-label",h?"Expand sidebar":"Collapse sidebar"),S?.setAttribute("title",h?"Expand sidebar":"Collapse sidebar")};s(),S?.addEventListener("click",()=>{$?.classList.toggle("sidebar-collapsed"),localStorage.setItem(b,$?.classList.contains("sidebar-collapsed")?"1":"0"),s()}),e.$("#vault-picker-close")?.addEventListener("click",()=>e.$("#vault-picker-dialog")?.close()),e.$("#vault-picker-dialog")?.addEventListener("click",h=>{h.target.id==="vault-picker-dialog"&&e.$("#vault-picker-dialog").close()}),e.$("#sidebar-close")?.addEventListener("click",e.closeMobileShell),e.$("#sidebar-backdrop")?.addEventListener("click",e.closeMobileShell),document.querySelectorAll(".mobile-tab").forEach(h=>{h.addEventListener("click",()=>{let r=h.dataset.mobileView;r==="more"?(e.syncMobileNav(e.currentView),document.getElementById("mobile-menu-drawer")?.showModal()):e.goView(r)})}),document.querySelectorAll(".mobile-menu-link").forEach(h=>{h.addEventListener("click",()=>e.goView(h.dataset.view))});let g=e.$("#mobile-menu-drawer");e.$("#mobile-menu-close")?.addEventListener("click",()=>g?.close()),g?.addEventListener("click",h=>{h.target===g&&g.close()}),e.$("#btn-refresh")?.addEventListener("click",async()=>{await e.refresh();let h=++e.viewDataLoadGen;e.setViewLoading(!0);try{await e.loadViewData(e.currentView),h===e.viewDataLoadGen&&e.render()}finally{h===e.viewDataLoadGen&&e.setViewLoading(!1)}}),window.addEventListener("resize",()=>{window.innerWidth>900&&e.closeMobileShell()});let p=e.$("#notif-drawer");e.$("#btn-notifications")?.addEventListener("click",()=>{e.renderNotifications(),p?.showModal()}),p?.addEventListener("click",h=>{h.target===p&&p.close()}),e.$("#notif-read-all")?.addEventListener("click",async()=>{await e.api("/notifications/read-all",{method:"POST"}),await e.refresh(),e.renderNotifications(),e.updateBadges()}),e.$("#world-select")?.addEventListener("change",async h=>{let r=h.target,a=r.value||"root";r.disabled=!0;try{e.setActiveWorld(a),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.currentView==="world"&&(e.state.inspectorWorldId=a,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.patchWorldPanels()),await e.onWorldContextChanged({vaultWorldId:a,forceVault:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.state.agentsTab==="vault"?e.patchAgentsVaultPanel():e.render({graphs:!1}),e.updateWorldContextChrome()}catch(n){console.error("world switch failed:",n)}finally{r.disabled=!1}}),window.addEventListener("error",h=>{console.error("UI error:",h.error||h.message),e.state?.config?.my_name||e.setConnectionStatus("UI error \u2014 hard refresh","paused")}),document.addEventListener("visibilitychange",()=>{document.hidden?(e.refreshTimer&&(clearTimeout(e.refreshTimer),e.refreshTimer=null),e.stopLivePoll()):(e.scheduleBackgroundRefresh(),!e.livePollTimer&&e.state?.config&&e.startLivePoll())})}var F={};function yt(){pe(F),me(F),he(F),ge(F),be(F),fe(F),ve(F),ye(F),_e(F),we(F),$e(F),Se(F),ke(F),Ce(F),Ie(F),Ae(F),Oe(F),Re(F),Le(F),De(F),Te(F),Pe(F),Ee(F),We(F),Me(F),Ve(F),Fe(F),Ge(F),Ne(F),Be(F),je(F),He(F),ze(F)}yt();F.initRouter();Ke(F);window.__FOS=F;Object.defineProperty(window,"currentView",{get:()=>F.currentView,set:e=>{F.currentView=e}});window.drawGraphs=(...e)=>F.drawGraphs(...e);window.drawDashboardCharts=(...e)=>F.drawDashboardCharts(...e);window.render=(...e)=>F.render(...e);F.boot();F.scheduleBackgroundRefresh();
