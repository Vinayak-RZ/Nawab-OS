var Ee=(e,L=document)=>L.querySelector(e),Ve=(e,L=document)=>[...L.querySelectorAll(e)];function ne(e){e.$=Ee,e.$$=Ve}function Fe(e){let L=document.createElement("div");return L.textContent=e??"",L.innerHTML}function Ge(e){return"$"+Number(e||0).toLocaleString(void 0,{maximumFractionDigits:0})}function Ne(e){return e?new Date(typeof e=="number"&&e<1e12?e*1e3:e).toLocaleString():""}function je(e){return new Promise(L=>setTimeout(L,e))}function oe(e){e.esc=Fe,e.fmtMoney=Ge,e.fmtTime=Ne,e.sleep=je}function He(e,L){try{let I=localStorage.getItem(e);return I?JSON.parse(I):L}catch(I){return console.warn(`[storage] corrupt ${e}, resetting`,I),localStorage.removeItem(e),L}}function re(e){e.readJsonStorage=He}var Be="Nawab OS",Ue=[{id:"pulse",label:"Pulse",role:"aggregator",tool_count:0,brief:"Operating pulse across parallel projects"},{id:"outreach",label:"Outreach",role:"outreach",tool_count:0,brief:"Outreach drafts and CRM pipeline"},{id:"leads",label:"Leads",role:"leads",tool_count:0,brief:"Lead lists and contact priorities"},{id:"market",label:"Market intel",role:"research",tool_count:0,brief:"Industry and competitor intelligence"},{id:"vault",label:"Vault",role:"knowledge",tool_count:0,brief:"Knowledge vault librarian"}],qe=[{id:"auto",label:"Auto",hint:"Agent picks retrieval"},{id:"hybrid",label:"Hybrid RAG",hint:"Dense + BM25 fusion"},{id:"graphrag",label:"GraphRAG",hint:"Knowledge graph communities"},{id:"vault",label:"Vault",hint:"World knowledge vault"},{id:"documents",label:"Documents",hint:"Ingested document store"}],Je={dashboard:"Control center",chat:"Ask agent",agents:"Agent fleet",world:"Worlds",approvals:"Approvals",crm:"CRM & pipeline",goals:"Goals & tasks",memory:"Memory",documents:"Documents",history:"History",tools:"Tools",activity:"Activity",settings:"Settings"},Ke=["prospect","contacted","replied","meeting","won","lost","nurture"],ze=["prospect","contacted","responded","meeting_set","closed","dead"],Ye=["#f75440","#00666b","#03904a","#051f13","#5a403c","#8f706b","#e3beb8"],Qe=15,Xe=30,Ze=5e3,xe=3e4,et=3e4,tt={aggregator:{label:"Aggregator",cls:"agent-role--aggregator",avatar:"agent-avatar--aggregator"},outreach:{label:"Outreach",cls:"agent-role--outreach",avatar:"agent-avatar--outreach"},leads:{label:"Leads",cls:"agent-role--leads",avatar:"agent-avatar--leads"},research:{label:"Intel",cls:"agent-role--research",avatar:"agent-avatar--research"},knowledge:{label:"Vault",cls:"agent-role--vault",avatar:"agent-avatar--knowledge"}},at={supervisor:"SV",pulse:"PL",outreach:"OR",leads:"LD",market:"MK",vault:"VL"},st={root:{label:"Main",cls:"world-kind--root"},project:{label:"Startup",cls:"world-kind--project"},startup:{label:"Startup",cls:"world-kind--project"},technical:{label:"Technical",cls:"world-kind--research"},idea:{label:"Idea",cls:"world-kind--idea"},research:{label:"Research",cls:"world-kind--research"}};function ie(e){Object.assign(e,{APP_NAME:Be,DEFAULT_SPECIALISTS:Ue,RAG_MODES:qe,TITLES:Je,CRM_STATUSES:Ke,COMPANY_STATUSES:ze,CHART_COLORS:Ye,MSG_READ_INITIAL_LINES:Qe,MSG_READ_EXPAND_LINES:Xe,LIVE_POLL_MS:Ze,LIVE_POLL_HIDDEN_MS:xe,REFRESH_MS:et,AGENT_ROLES:tt,AGENT_INITIALS:at,WORLD_KINDS:st})}function le(e){async function L(v,t,f="POST"){let h=await fetch("/api"+v,{method:f,body:t,credentials:"same-origin"}),g=await h.json().catch(()=>({}));if(h.status===401&&g.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!h.ok)throw new Error(g.error||h.statusText);return g}async function I(v,t={}){let f=new AbortController,h=t.timeoutMs??3e4,g=setTimeout(()=>f.abort(),h),{timeoutMs:o,headers:a,signal:s,...c}=t;try{let r=await fetch("/api"+v,{...c,credentials:"same-origin",headers:{"Content-Type":"application/json",...a||{}},signal:s||f.signal}),b=await r.json().catch(()=>({}));if(r.status===401&&b.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!r.ok)throw new Error(b.error||r.statusText);return b}catch(r){throw r.name==="AbortError"?new Error("Request timed out \u2014 is the server running?"):r}finally{clearTimeout(g)}}e.api=I,e.apiUpload=L}function de(e){function L(){let I=localStorage.getItem("fos_selected_specialist");if(I!==null)return I;let v=localStorage.getItem("fos_selected_agent");return v&&v!=="supervisor"?v:""}e.state={live:{},selectedSpecialist:L(),ragMode:localStorage.getItem("fos_rag_mode")||"auto",activeWorldId:localStorage.getItem("fos_active_world")||"root",agentsTab:localStorage.getItem("fos_agents_tab")||"runs",expandedRunId:null,ui:{worldCreateOpen:!1,crmFormOpen:!1,goalsFormOpen:!1,reminderFormOpen:!1,vaultFacet:null,vaultDocForm:null,vaultDocEdit:null},_worldTemplates:null,_operations:{},_chatAttachments:[]},e.state._syncingLinkIds=new Set,e.currentView="dashboard",e.chatHistory=e.readJsonStorage("fos_chat",[]),e.historyTab=localStorage.getItem("fos_history_tab")||"conversations",e.documentsEditMode=!1,e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.livePollTimer=null,e._runtimePollTick=0,e.whatsappPollTimer=null,e.memoryGraphTab="graph",e.worldGraphTab="hierarchy",e.lastLiveActive=!1,e.viewDataLoadGen=0,e.vaultLoadGen=0,e.graphDrawCache={},e.actionBusyDepth=0,e.actionBusyButton=null,e.refreshTimer=null,e.loadSelectedSpecialist=L}function ce(e){function L(){let c=e.state.config||{};return c.my_name?`${c.my_name}'s ${e.APP_NAME}`:e.APP_NAME}function I(){return e.state.activeWorldId||e.$("#world-select")?.value||"root"}function v(){let c=e.state.worlds||e.state._worldFull?.worlds||{},r=e.currentWorldId();return r==="root"?c.root?.name||"Main world":(c.children||[]).find(R=>R.id===r)?.name||r}function t(c){e.state.activeWorldId=c||"root",localStorage.setItem("fos_active_world",e.state.activeWorldId),e.populateWorldSelect(),e.updateWorldContextChrome()}function f(){let c=e.$("#world-select");if(!c)return;let r=e.state.activeWorldId||"root";[...c.options].some(b=>b.value===r)&&(c.value=r)}function h(){let c=e.activeWorldLabel();document.querySelectorAll("[data-active-world-label]").forEach(r=>{r.textContent=c}),e.syncWorldSelectValue(),e.currentView==="world"&&e.patchWorldTreeNav()}function g(){let c=e.$("#specialist-select-agents")?.value??e.state.selectedSpecialist??"";return c==="auto"?"":c||""}function o(){return e.$("#rag-mode-select")?.value||e.state.ragMode||"auto"}function a(){return!!e.currentSpecialistId()}function s(){let c=e.$("#world-select");if(!c)return;let r=e.state.worlds||e.state._worldFull?.worlds||{},b=r.root,R=r.children||[],C=R.map(J=>`<option value="${e.esc(J.id)}">${e.esc(J.name)} \xB7 ${e.esc(J.kind||"project")}</option>`).join("");c.innerHTML=`
      <optgroup label="Main">
        <option value="root">${e.esc(b?.name||"Main world")} \u2014 all context</option>
      </optgroup>
      ${R.length?`<optgroup label="Sub-worlds">${C}</optgroup>`:""}`;let A=e.state.activeWorldId||"root";[...c.options].some(J=>J.value===A)?c.value=A:(c.value="root",e.state.activeWorldId="root",localStorage.setItem("fos_active_world","root"))}e.ownerLabel=L,e.currentWorldId=I,e.activeWorldLabel=v,e.setActiveWorld=t,e.syncWorldSelectValue=f,e.updateWorldContextChrome=h,e.currentSpecialistId=g,e.currentRagMode=o,e.isDirectSpecialist=a,e.populateWorldSelect=s}function pe(e){function L(a,s={}){e.state._viewLoading=!!a;let c=document.getElementById("global-progress"),r=c?.querySelector(".global-progress__bar");c&&(c.hidden=!a,c.setAttribute("aria-hidden",a?"false":"true"),a&&s.progress==null?(c.classList.add("is-indeterminate"),r&&(r.style.width="")):a&&s.progress!=null?(c.classList.remove("is-indeterminate"),r&&(r.style.width=`${Math.min(100,s.progress)}%`)):(c.classList.remove("is-indeterminate"),r&&(r.style.width="0")))}function I(a){e.actionBusyDepth++,e.actionBusyDepth===1&&(e.state._viewLoading||e.setViewLoading(!0),document.body.classList.add("is-action-busy"));let s=a?.closest?.("button, [role='button']")||a;s&&!e.actionBusyButton&&(e.actionBusyButton=s,s.classList.add("is-loading"),s.setAttribute("aria-busy","true"),"disabled"in s&&(s.disabled=!0))}function v(a){let s=a?.closest?.("button, [role='button']")||a;s&&e.actionBusyButton===s&&(s.classList.remove("is-loading"),s.removeAttribute("aria-busy"),"disabled"in s&&!s.dataset.keepDisabled&&(s.disabled=!1),e.actionBusyButton=null),e.actionBusyDepth=Math.max(0,e.actionBusyDepth-1),e.actionBusyDepth===0&&(e.state._viewLoading||e.setViewLoading(!1),document.body.classList.remove("is-action-busy"))}function t(a,s){e.beginActionBusy(s);try{let c=a();return c!=null&&typeof c.then=="function"?c.finally(()=>e.endActionBusy(s)):(e.endActionBusy(s),c)}catch(c){throw e.endActionBusy(s),c}}function f(a){return!a||a.id==="chat-send"||a.id==="chat-clear"||a.dataset.toggleUi!==void 0||a.dataset.goto!==void 0||a.dataset.toggleRun!==void 0||a.dataset.memoryTab!==void 0||a.dataset.vaultFacet!==void 0||a.dataset.vaultAddDoc!==void 0||a.dataset.vaultCancelDoc!==void 0||a.dataset.removeAttachment!==void 0||a.dataset.historyTab!==void 0||a.dataset.pickVaultDoc!==void 0||a.dataset.cancelEdit!==void 0||a.dataset.editWorld!==void 0||a.dataset.docsAction==="toggle"}function h(a="72%"){return`<span class="skeleton" style="display:block;height:12px;width:${a}"></span>`}function g(a=3){return`<div class="skeleton-card driver-card">${Array.from({length:a},(c,r)=>e.skeletonLine(r===0?"38%":"88%")).join("")}</div>`}function o(a){let s=`<div class="skeleton-grid">${e.skeletonCard(2)}${e.skeletonCard(2)}${e.skeletonCard(2)}</div>`;return a==="dashboard"?`<div class="view-skeleton dashboard-grid">${e.skeletonCard(2)}<div class="span-8">${e.skeletonCard(4)}</div><div class="span-4">${e.skeletonCard(2)}</div>${s}</div>`:a==="chat"?`<div class="view-skeleton"><div class="skeleton-card driver-card">${e.skeletonLine("30%")}${e.skeletonLine("60%")}</div><div class="skeleton-card driver-card" style="min-height:280px">${e.skeletonLine("100%")}${e.skeletonLine("92%")}${e.skeletonLine("78%")}</div></div>`:a==="world"?`<div class="view-skeleton dashboard-grid"><div class="span-4">${e.skeletonCard(3)}</div><div class="span-8">${e.skeletonCard(5)}</div>${s}</div>`:a==="documents"?`<div class="view-skeleton docs-workspace"><div class="skeleton-card driver-card">${e.skeletonCard(4)}</div><div class="skeleton-card driver-card">${e.skeletonCard(6)}</div></div>`:`<div class="view-skeleton">${e.skeletonCard(3)}${s}</div>`}e.setViewLoading=L,e.beginActionBusy=I,e.endActionBusy=v,e.runWithActionBusy=t,e.shouldSkipActionBusy=f,e.skeletonLine=h,e.skeletonCard=g,e.renderViewSkeleton=o}function ue(e){function L(){e.state._worldVault=null,e.state._vaultGraph=null,e.state._vaultWorldId=null,e.state._vaultLoading=!1}function I(){return e.state._worldVault?.vault||e.state._worldVault||null}function v(s){return!!(s&&s!=="root"&&e.state._vaultWorldId===s&&e.vaultPayload())}function t(s,c=""){if(!s)return`${c}:empty`;let r=s.nodes||[],b=s.edges||[],R=s.meta||{},C=r.slice(0,12).map(A=>`${A.data?.id}:${A.data?.label}`).join("|");return`${c}:${r.length}:${b.length}:${R.updated||""}:${R.document_count||""}:${C}`}function f(...s){if(!s.length){Object.keys(e.graphDrawCache).forEach(c=>delete e.graphDrawCache[c]);return}s.forEach(c=>delete e.graphDrawCache[c])}function h(s,c,r={},b="Nothing to visualize yet."){if(!window.FOSGraph)return null;let R=document.getElementById(s);if(!R)return null;let C=R.parentElement?.querySelector(`[data-graph-placeholder-for="${s}"]`);C||(C=document.createElement("p"),C.className="graph-placeholder body-md muted",C.dataset.graphPlaceholderFor=s,R.insertAdjacentElement("afterend",C));let A=c?.nodes||[],J=c?.edges||[],ee=A.length===1&&A[0]?.data?.type==="empty",P=A.length===1&&A[0]?.data?.type==="loading",E=A.length+J.length>0&&!ee&&!P,B=e.graphDataSignature(c,`${s}:${r.layout?.name||"default"}:${r.onSelect?"interactive":"static"}`),q=null;return E?e.graphDrawCache[s]===B&&FOSGraph.getCy(s)&&!r.onSelect?q=FOSGraph.getCy(s):(q=FOSGraph.render(s,c,r),e.graphDrawCache[s]=B):(FOSGraph.destroy(s),delete e.graphDrawCache[s]),q?(R.classList.remove("is-empty"),C.hidden=!0):(R.classList.add("is-empty"),C.hidden=!1,C.textContent=P?A[0]?.data?.label||"Loading\u2026":b),q}function g(s){e.worldGraphTab=s,document.querySelectorAll("[data-world-graph-tab]").forEach(r=>{r.classList.toggle("is-active",r.dataset.worldGraphTab===s)});let c=document.getElementById("world-graph-legend");c&&(c.innerHTML=e.worldGraphLegendHtml(s)),e.drawGraphs()}async function o(){if(window.FOSGraph){try{window.FOSVendors&&await window.FOSVendors.ensure(["cytoscape"])}catch(s){console.warn("cytoscape load failed:",s);return}if(e.currentView==="dashboard"&&e.state._runtimeGraph&&e.renderGraphOrPlaceholder("graph-runtime-dash",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:20}},"Runtime graph appears when an agent is active."),e.currentView==="agents"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-agents")&&e.renderGraphOrPlaceholder("graph-runtime-agents",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="chat"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-chat")&&e.renderGraphOrPlaceholder("graph-runtime-chat",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="world"){let s=e.worldById(e.inspectorWorldId());if(e.worldGraphTab==="vault"&&!e.isRootWorld(s))e.renderGraphOrPlaceholder("graph-world",e.vaultGraphForWorld(s),{layout:FOSGraph.HIERARCHY_LAYOUT,onSelect:c=>{c.facet_id&&(e.state.ui={...e.state.ui||{},vaultFacet:c.facet_id},e.patchWorldPanels())}},"No files yet \u2014 add documents or link a GitHub repo in the knowledge panel below.");else{let c=e.worldGraphTab==="ecosystem"?e.state._worldGraph:e.state._worldHierarchyGraph||e.state._worldGraph;c?(e.renderGraphOrPlaceholder("graph-world",c,{layout:e.worldGraphTab==="hierarchy"?FOSGraph.HIERARCHY_LAYOUT:FOSGraph.LAYOUT,onSelect:r=>{r.world_id&&e.selectInspectorWorld(r.world_id)}},"World map will appear once your hierarchy is loaded."),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())):e.renderGraphOrPlaceholder("graph-world",null,{},"World map will appear once your hierarchy is loaded.")}}e.currentView==="memory"&&e.state._memoryGraph&&e.renderGraphOrPlaceholder("graph-memory",e.state._memoryGraph,{onSelect:s=>{let c=e.$("#graph-memory-detail");c&&(c.textContent=`${s.type}: ${s.label}`)}},"Memory graph fills in as you store knowledge and run agents.")}}async function a(){let s=e.currentView;if(["dashboard","agents","chat","world"].includes(s)&&!e.state._runtimeGraph)try{e.state._runtimeGraph=await e.api("/graph/runtime")}catch{e.state._runtimeGraph=null}if(s==="world"){if(!e.state._worldFull?.graph)try{let r=await e.api("/graph/world");e.state._worldGraph=r?.graph??null,e.state._worldHierarchyGraph=r?.hierarchy_graph??null,e.state._worldPreviews=r?.world_previews??{},e.state._worldFull=r,e.invalidateGraphCache("graph-world")}catch{}}else s==="dashboard"&&e.state._world&&(e.state._worldGraph=e.state._world.graph??e.state._worldGraph??null,e.state._world.worlds&&!e.state.worlds?.root&&(e.state.worlds=e.state._world.worlds));if(s==="memory"&&!e.state._memoryFull?.graph)try{let r=await e.api("/graph/memory");e.state._memoryGraph=r.graph??null,e.state._memoryFull=r,e.invalidateGraphCache("graph-memory")}catch{}}e.clearVaultScopedState=L,e.vaultPayload=I,e.vaultReadyFor=v,e.graphDataSignature=t,e.invalidateGraphCache=f,e.renderGraphOrPlaceholder=h,e.switchWorldGraphTab=g,e.drawGraphs=o,e.loadGraphData=a}function me(e){function L(o,a="Waiting for activity\u2026"){return o?.length?`<div class="tool-flow">${o.map((s,c)=>{let r=c>0?'<span class="tool-flow-arrow" aria-hidden="true">\u2192</span>':"";if(s.type==="phase")return`${r}<span class="tool-flow-node">${e.esc(s.label)}</span>`;let b=s.decision==="approve"?" is-approve":s.decision==="deny"?" is-deny":"";return`${r}<span class="tool-flow-node${b}">${e.esc(s.name||s.label)}</span>`}).join("")}</div>`:`<p class="body-md muted">${e.esc(a)}</p>`}function I(o,a="live-panel"){let s=o?.jobs?.length?o.jobs:o?.active?[o]:[],c=s.some(A=>A.active||A.status==="running")||o?.active,r=s[0]||o||{},b=r.events||o?.events||[],R=b.map((A,J)=>`<option value="${J}"${J===b.length-1?" selected":""}>${e.esc(A.label||A.name||"Step")}</option>`).join(""),C=s.length?s.map(A=>`
      <div class="live-job${A.active||A.status==="running"?" is-active":""}">
        <div class="live-job__head">
          <span class="mono">${e.esc(A.specialist||A.mode||"agent")}</span>
          <span class="muted">${A.elapsed_s||0}s</span>
        </div>
        <p class="live-job__phase">${e.esc(A.phase||"Working\u2026")}</p>
        ${A.active||A.status==="running"?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(A.id)}">Stop</button>`:`<span class="badge-pill">${e.esc(A.status||"done")}</span>`}
      </div>`).join(""):"";return`<section class="live-panel${c?" is-active":""}" id="${a}" aria-live="polite">
      <div class="live-panel__head">
        <p class="caption-uppercase">Live operation</p>
        ${c&&r.id?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(r.id)}">Stop</button>`:""}
      </div>
      <p class="live-phase" id="${a}-phase">${e.esc(r.phase||o?.phase||"Idle \u2014 send a message or delegate a task")}</p>
      ${b.length?`<label class="live-phase-select"><span class="caption-uppercase">Step</span>
        <select class="world-select" id="${a}-step" aria-label="Current step">${R}</select></label>`:""}
      <div id="${a}-flow">${e.renderLiveFlow(b)}</div>
      ${C?`<div class="live-jobs">${C}</div>`:""}
      ${c&&o?.elapsed_s?`<p class="world-meta">${o.elapsed_s}s elapsed \xB7 ${e.esc(o.actor||r.specialist||"")}</p>`:""}
    </section>`}function v(o){let a=e.$("#live-strip"),s=e.$("#live-strip-text");if(!a)return;let c=!!o?.active;c!==e.lastLiveActive&&(FOSMotion?.pulseLiveStrip?.(c),e.lastLiveActive=c),s&&c&&(s.textContent=o.phase||"Agent working\u2026")}function t(o){e.state.live=o||{},e.updateLiveStrip(o),e.$$("[id$='-phase']").forEach(a=>{a.textContent=o?.phase||"Idle"}),e.$$("[id$='-flow']").forEach(a=>{a.innerHTML=e.renderLiveFlow(o?.events||[])}),e.$$(".live-panel").forEach(a=>a.classList.toggle("is-active",!!o?.active))}async function f(){try{let o=await e.api("/live",{timeoutMs:15e3});if(e.state.live=o,e.patchLiveUI(o),["dashboard","agents","chat"].includes(e.currentView)&&(o?.active||e._runtimePollTick++%4===0)){let s=e.graphDataSignature(e.state._runtimeGraph,"runtime");e.state._runtimeGraph=await e.api("/graph/runtime").catch(()=>e.state._runtimeGraph);let c=e.graphDataSignature(e.state._runtimeGraph,"runtime");s!==c&&(e.invalidateGraphCache("graph-runtime-dash","graph-runtime-agents","graph-runtime-chat"),e.drawGraphs())}}catch{}}function h(){e.stopLivePoll(),e._runtimePollTick=0,e.pollLive(),e.scheduleLivePoll()}function g(){e.livePollTimer&&(clearTimeout(e.livePollTimer),e.livePollTimer=null)}e.renderLiveFlow=L,e.renderLivePanel=I,e.updateLiveStrip=v,e.patchLiveUI=t,e.pollLive=f,e.startLivePoll=h,e.stopLivePoll=g}function he(e){function L(f){return e.state._syncingLinkIds.has(String(f))}function I(){let f=document.getElementById("ops-stack");if(!f)return;let h=Date.now(),g=Object.values(e.state._operations||{}).filter(o=>o.status==="running"||o.finishedAt&&h-o.finishedAt<8e3).slice(0,5);if(!g.length){f.innerHTML="",f.hidden=!0;return}f.hidden=!1,f.innerHTML=g.map(o=>{let a=Math.round((o.progress||0)*100),s=o.status==="running"?"is-running":o.status==="error"?"is-error":"is-done",c=o.status==="running"?"Working":o.status==="error"?"Failed":"Done";return`<div class="ops-card ${s}" data-op-id="${e.esc(o.id)}">
        <div class="ops-card__head">
          <span class="ops-card__title">${e.esc(o.title)}</span>
          <span class="ops-card__status">${c}</span>
        </div>
        <p class="ops-card__detail">${e.esc(o.detail||"")}</p>
        ${o.status==="running"?`<div class="ops-card__bar" role="progressbar" aria-valuenow="${a}" aria-valuemin="0" aria-valuemax="100"><span style="width:${a}%"></span></div>`:""}
      </div>`}).join("")}async function v(f,h,g={}){let o=f;e.state._operations[o]={id:o,title:h,detail:"Scanning repository\u2026",progress:0,status:"running"},g.linkId!=null&&e.state._syncingLinkIds.add(String(g.linkId)),e.renderOpsStack(),g.worldId&&e.currentView==="world"&&e.render();try{for(;;){let a=await e.api(`/sync-jobs/${encodeURIComponent(f)}/batch`,{method:"POST",body:JSON.stringify({batch_size:8}),timeoutMs:18e4}),s=e.state._operations[o];if(s&&(s.progress=a.progress||0,s.detail=a.message||`${a.imported||0} files imported`,s.status=a.status==="failed"?"error":a.done?"done":"running"),e.renderOpsStack(),a.done)break}}catch(a){let s=e.state._operations[o];throw s&&(s.status="error",s.detail=a.message||"Sync failed",s.finishedAt=Date.now()),e.renderOpsStack(),a}finally{let a=e.state._operations[o];a&&!a.finishedAt&&(a.finishedAt=Date.now()),g.linkId!=null&&e.state._syncingLinkIds.delete(String(g.linkId)),e.renderOpsStack();try{await e.refresh(),g.worldId&&await e.reloadVault(g.worldId,{force:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.patchAgentsVaultPanel(),e.updateBadges()}catch{}setTimeout(()=>{delete e.state._operations[o],e.renderOpsStack()},8e3)}}async function t(f){let h=await e.api(`/worlds/${encodeURIComponent(f)}/sync-jobs`).catch(()=>({jobs:[]}));for(let g of h.jobs||[])!g?.id||e.state._operations[g.id]||e.runGithubSyncJob(g.id,`Syncing ${g.full_name}`,{worldId:f,linkId:g.link_id}).catch(console.error)}e.isLinkSyncing=L,e.renderOpsStack=I,e.runGithubSyncJob=v,e.resumeActiveSyncJobs=t}function ge(e){function L(){e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit"}async function I(f,h,g){let o=e.$("#md-editor-dialog");if(!(!o||!f||!h)){e.mdEditorState={mode:"vault",artifactId:null,worldId:f,docId:h,editMode:!1},e.$("#md-dialog-title").textContent=g||"Document",e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit",e.$("#md-dialog-preview").innerHTML="<p class='body-md muted'>Loading\u2026</p>",o.showModal();try{let s=(await e.api(`/worlds/${encodeURIComponent(f)}/vault/documents/${encodeURIComponent(h)}/content`,{timeoutMs:2e4})).content||"";e.$("#md-dialog-source").value=s;let c=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(c,s)}catch(a){e.$("#md-dialog-preview").innerHTML=`<p class="body-md" style="color:var(--color-warn)">${e.esc(a.message||"Could not load document")}</p>`}}}async function v(){let f=e.$("#md-dialog-source")?.value??"";if(e.mdEditorState.mode==="vault"&&e.mdEditorState.worldId&&e.mdEditorState.docId){await e.api(`/worlds/${encodeURIComponent(e.mdEditorState.worldId)}/vault/documents/${encodeURIComponent(e.mdEditorState.docId)}`,{method:"PATCH",body:JSON.stringify({content:f}),timeoutMs:15e3});let g=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(g,f),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit";return}if(!e.mdEditorState.artifactId)return;await e.api(`/artifacts/${e.mdEditorState.artifactId}/content`,{method:"PUT",body:JSON.stringify({content:f}),timeoutMs:15e3});let h=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(h,f),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}function t(){e.$("#md-dialog-close")?.addEventListener("click",()=>{e.$("#md-editor-dialog")?.close(),e.resetMdEditorDialog()}),e.$("#md-dialog-mode")?.addEventListener("click",async()=>{if(e.mdEditorState.mode!=="vault"&&!e.mdEditorState.artifactId)return;e.mdEditorState.editMode=!e.mdEditorState.editMode;let f=e.$("#md-dialog-source"),h=e.$("#md-dialog-preview");if(e.mdEditorState.editMode)f.hidden=!1,h.hidden=!0,e.$("#md-dialog-save").hidden=!1,e.$("#md-dialog-mode").textContent="Preview";else{let g=f?.value??"";await window.FOSMarkdown?.renderInto?.(h,g),f.hidden=!0,h.hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}}),e.$("#md-dialog-save")?.addEventListener("click",()=>e.saveMdEditor().catch(f=>alert(f.message)))}e.resetMdEditorDialog=L,e.openVaultDocViewer=I,e.saveMdEditor=v,e.initMdEditorDialog=t}function fe(e){function L(){let o=e.state._nudges||[];return o.length?`<section class="driver-card span-12 up-next-panel">
      <p class="caption-uppercase">Up next</p>
      <p class="body-md muted">Reminders, follow-ups, approvals, and vault prompts for your active world.</p>
      <ul class="up-next-list">${o.slice(0,8).map((s,c)=>`
      <li class="up-next-item${(s.priority||9)<=2?" is-urgent":""}">
        <div class="up-next-item__body">
          <p class="up-next-item__title">${e.esc(s.title)}</p>
          <p class="up-next-item__meta muted">${e.esc(s.body||"")}</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-nudge-index="${c}">Open</button>
      </li>`).join("")}</ul>
    </section>`:""}function I(o){let a=e.state._nudges?.[Number(o)];if(!a)return;if(a.kind==="vault_leads"&&a.meta?.doc_id){e.tagVaultDocInChat(a.meta.doc_id,a.meta.world_id,a.title,"");return}let s=a.action||"chat";if(s==="crm")return e.goView("crm");if(s==="goals")return e.goView("goals");if(s==="approvals")return e.goView("approvals");if(s==="documents")return e.goView("documents");if(s==="world")return e.goView("world");e.goView(s)}function v(o,a,s){let c=document.getElementById(o);if(!c)return;let r=c.closest(".chart-panel");if(!r)return;let b=r.querySelector(".chart-empty");b||(b=document.createElement("p"),b.className="chart-empty muted body-md",r.appendChild(b)),b.textContent=a,b.hidden=!s,c.hidden=s}function t(){let o=window.innerWidth<640,a=e.state._world?.tools_by_category||e.state.about?.tools_by_category||{},s=Object.entries(a).slice(0,o?5:8);s.length&&e.$("#chart-tools")?(e.chartPanelNote("chart-tools","",!1),FOSCharts.bar("chart-tools",s.map(([C])=>C),s.map(([,C])=>C),{colors:e.CHART_COLORS})):e.chartPanelNote("chart-tools","No tool data yet.",!0);let c=e.state.snapshot?.crm?.by_status||{},r=Object.entries(c).filter(([,C])=>C>0).map(([C,A])=>({label:C,value:A}));r.length&&e.$("#chart-crm")?(e.chartPanelNote("chart-crm","",!1),FOSCharts.donut("chart-crm",r,{centerLabel:"contacts",colors:e.CHART_COLORS})):e.chartPanelNote("chart-crm","No CRM contacts yet \u2014 add leads in Chat or CRM.",!0);let R=[...e.state.usage_history||[]].reverse().map(C=>C.llm_calls||C.calls||0);R.length&&e.$("#chart-usage")?(e.chartPanelNote("chart-usage","",!1),FOSCharts.spark("chart-usage",R)):e.chartPanelNote("chart-usage","No LLM usage in the last 7 days.",!0)}function f(){let o=e.state.config||{},a=e.state.snapshot?.approvals_pending||0,s=o.agent_paused;return`
      <section class="driver-card span-12 operator-panel" aria-label="Direct actions">
        <div class="operator-panel__head">
          <div>
            <p class="section-eyebrow">You drive</p>
            <h3 class="title-sm">Direct controls</h3>
            <p class="body-md muted">Manage worlds, CRM, goals, and agent policy yourself. Chat is optional \u2014 use it when you want help.</p>
          </div>
          <div class="operator-panel__status">
            <span class="pill ${s?"warn":"ok"}">${s?"Agent paused":"Agent on standby"}</span>
            <span class="pill info">${e.esc(o.autonomy_level||"balanced")} autonomy</span>
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
      </section>`}function h(o){if(e.state.ui||(e.state.ui={}),o==="create-world"){e.state.ui.worldCreateOpen=!0,e.currentView==="world"?(e.render(),requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"}))):(e.goView("world"),e.state._scrollWorldCreate=!0);return}if(o==="add-contact"){e.state.ui.crmFormOpen=!0,e.currentView==="crm"?e.render():e.goView("crm");return}if(o==="add-goal"){e.state.ui.goalsFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}if(o==="add-reminder"){e.state.ui.reminderFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}o==="settings"&&e.goView("settings"),o==="approvals"&&e.goView("approvals")}function g(){let o=e.state.snapshot||{},a=o.crm||{},s=e.state.finance||{},c=e.state.usage||{},r=e.state.about||{},b=e.state.config||{},R=o.approvals_pending||0,C=s.set?`<span class="pill ${s.status==="healthy"?"ok":s.status==="warning"?"warn":"info"}">${e.esc(s.status)}</span>`:"",A=s.set?s.runway||(s.runway_months!=null?s.runway_months+" mo":"\u2014"):null,J=(e.state.goals||[]).slice(0,5).map(B=>`<li>${e.esc(B.title)}</li>`).join("")||"<li class='muted'>No active goals \u2014 add one in Goals or use Direct controls.</li>",ee=R>0?`<div class="spec-cell race-position-cell"><dt>Approvals</dt><dd>${R}</dd></div>`:'<div class="spec-cell"><dt>Approvals</dt><dd>0</dd></div>',P=e.state.live||{},E=e.state._agents||{};return`<div class="dashboard-grid">
        ${e.renderUpNext()}
        ${e.renderOperatorPanel()}
        <section class="driver-card span-8">
          ${e.renderLivePanel(P)}
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">World state</p>
          <p class="world-meta" style="margin-top:var(--space-xxs)">Updated ${e.esc(o.ts||"now")}</p>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tools</dt><dd>${r.total_tools||0}</dd></div>
            <div class="spec-cell"><dt>Agents</dt><dd>${(E.specialists?.length||4)+1}</dd></div>
            <div class="spec-cell"><dt>Contacts</dt><dd>${a.total_contacts||0}</dd></div>
            ${ee}
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
          <div class="activity-timeline">${(e.state.actions||[]).slice(0,8).map(B=>`<div class="activity-timeline__row"><span class="mono">${e.esc(B.tool_name)}</span><span class="muted">${e.esc((B.created_at||"").slice(11,19))}</span></div>`).join("")||"<p class='muted'>No tool actions yet</p>"}</div>
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">Specialist status</p>
          <div class="specialist-chips">${e.listSpecialists(E).map(B=>`<span class="specialist-chip${e.agentBusy(P,B.id)?" is-busy":""}">${e.esc(B.label)}</span>`).join("")}</div>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents" style="margin-top:var(--space-sm)">Open agents</button>
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Runway ${C}</p>
          ${A?`<dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Cash</dt><dd class="small">${e.fmtMoney(s.cash)}</dd></div>
            <div class="spec-cell"><dt>Burn</dt><dd class="small">${e.fmtMoney(s.monthly_burn)}</dd></div>
            <div class="spec-cell"><dt>MRR</dt><dd class="small">${e.fmtMoney(s.mrr)}</dd></div>
            <div class="spec-cell"><dt>Runway</dt><dd class="small">${e.esc(A)}</dd></div>
          </dl>`:'<p class="body-md" style="margin-top:var(--space-sm)">Set cash, burn, and MRR in Settings or ask the agent to track runway.</p>'}
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Active goals</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${J}</ul>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tasks open</dt><dd>${o.tasks_open||0}</dd></div>
            <div class="spec-cell"><dt>LLM today</dt><dd class="small">${c.llm_calls||0}</dd></div>
          </dl>
        </section>
      </div>`}e.renderUpNext=L,e.handleNudgeAction=I,e.chartPanelNote=v,e.drawDashboardCharts=t,e.renderOperatorPanel=f,e.openOperatorAction=h,e.renderDashboard=g}function be(e){function L(){return localStorage.getItem("fos_chat_session")||""}function I(S){S?localStorage.setItem("fos_chat_session",S):localStorage.removeItem("fos_chat_session")}function v(S){S?.session_id&&e.setChatSessionId(S.session_id)}async function t(){let S=e.chatSessionId();if(S)try{let l=await e.api(`/history/sessions/${S}`);l?.messages?.length&&(e.chatHistory=l.messages.map(m=>({role:m.role==="assistant"?"agent":m.role,text:m.content})),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)))}catch{}}function f(S={}){let l={world_id:e.currentWorldId(),rag_mode:e.currentRagMode(),session_id:e.chatSessionId()||void 0,specialist:e.currentSpecialistId()||void 0,...S},m=(e.state._chatAttachments||[]).filter(_=>_?.doc_id);return m.length&&(l.attachments=m.map(_=>({type:"vault",doc_id:_.doc_id,title:_.title,path:_.path}))),l}function h(S){if(S.pending)return`<div class="msg-pending"><span class="live-pulse" aria-hidden="true"></span> ${e.esc(S.pendingLabel||"Agent working\u2026")}</div>`;let l=S.text||"";if(S.role==="agent"||S.role==="assistant"){let m=window.FOSMarkdown?.render?.(l)||e.esc(l),_=(S.artifacts||[]).map(k=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${k.id}">${e.esc(k.title||k.kind||"Document")}</button>`).join("");return`<div class="msg-md">${m}</div>${_?`<div class="msg-artifacts">${_}</div>`:""}`}return`<div class="msg-plain">${e.esc(l)}</div>`}function g(S,l){return`msg:${S}:${e.chatSessionId()||"default"}:${l}`}function o(S){return S<=0?e.MSG_READ_INITIAL_LINES:S===1?e.MSG_READ_INITIAL_LINES+e.MSG_READ_EXPAND_LINES:1/0}function a(S){let l=S||document.getElementById("content");l&&(e.state._msgExpand||(e.state._msgExpand={}),l.querySelectorAll(".msg-read-more-host").forEach(m=>{let _=m.querySelector(":scope > .msg-md, :scope > .msg-plain"),k=m.querySelector(".msg-read-more");if(!_||!k)return;let O=m.dataset.msgScope||"chat",d=m.dataset.msgIndex??"0",p=e.msgExpandKey(O,d),$=e.state._msgExpand[p]||0,D=parseFloat(getComputedStyle(_).lineHeight)||21,T=Math.max(1,Math.round(_.scrollHeight/D)),V=e.msgReadLineLimit($);if(k.dataset.msgReadMore=p,V>=T||$>=2){_.classList.remove("msg-body--clamped"),_.style.maxHeight="",k.hidden=!0;return}_.classList.add("msg-body--clamped"),_.style.maxHeight=`${V*D}px`,k.hidden=!1,k.textContent="Read more"}))}function s(S){return S?.length?`<div class="msg-artifacts">${S.map(l=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${l.id}">${e.esc(l.title||l.kind||"File")}</button>`).join("")}</div>`:""}async function c(){let S=e.currentWorldId(),l=S&&S!=="root"?`?world_id=${encodeURIComponent(S)}`:"";try{let m=await e.api(`/history${l}`,{timeoutMs:15e3});e.state._chatSessions=m.sessions||[]}catch{e.state._chatSessions=e.state._chatSessions||[]}}function r(){let S=e.state._chatSessions||[],l=e.chatSessionId();return`<section class="chat-sessions-strip driver-card">
      <div class="chat-sessions-strip__head">
        <p class="caption-uppercase">Chats</p>
        <button type="button" class="button-primary button-sm" data-new-chat-session>+ New</button>
      </div>
      <div class="chat-sessions-strip__list">${S.map(_=>`
      <button type="button" class="chat-session-chip${_.id===l?" is-active":""}" data-chat-session="${e.esc(_.id)}">
        <span class="chat-session-chip__title">${e.esc(_.title||"Conversation")}</span>
        <span class="chat-session-chip__meta">${e.fmtHistoryTime(_.updated_at)}</span>
      </button>`).join("")||"<span class='muted body-md'>No previous chats</span>"}</div>
    </section>`}async function b(S){e.openDocumentsWorkspace(S)}function R(){let S=e.state._chatAttachments||[];return S.length?`<div class="chat-attachments">${S.map((l,m)=>`<span class="chat-attachment-chip">
        <span>\u{1F4CE} ${e.esc(l.title||"File")}</span>
        <button type="button" class="chat-attachment-chip__remove" data-remove-attachment="${m}" aria-label="Remove attachment">\xD7</button>
      </span>`).join("")}</div>`:""}async function C(){let S=e.currentWorldId();if(!S||S==="root"){alert("Select a project world (not Main) to attach vault documents.");return}await e.ensureVaultForWorld(S);let l=e.vaultPayload()||{},m=l.facets||l.folders||[],_=[];for(let d of m)for(let p of d.documents||[])e.isMarkdownFilename(p.filename||p.github_path)&&_.push(p);let k=e.$("#vault-picker-list"),O=e.$("#vault-picker-dialog");!k||!O||(k.innerHTML=_.length?_.map(d=>`
      <button type="button" class="vault-picker-item" data-pick-vault-doc="${d.id}" data-world-id="${e.esc(S)}" data-doc-title="${e.esc(d.title)}" data-doc-path="${e.esc(d.github_path||d.filename||"")}">
        <strong>${e.esc(d.title)}</strong>
        <span class="muted">${e.esc(d.github_path||d.filename||"")}</span>
      </button>`).join(""):"<p class='body-md muted'>No markdown docs in vault \u2014 link and sync a GitHub repo in Worlds.</p>",O.showModal())}async function A(S){for(;;){let l=await e.api(`/chat/jobs/${encodeURIComponent(S)}`,{timeoutMs:2e4}),m=l.job;if(!m)break;if(e.state._activeJob=m,e.patchLiveUI(e.state.live),e.patchChatJobBubble(m),["completed","failed","cancelled"].includes(m.status))return{job:m,pending_approvals:l.pending_approvals};await e.sleep(1200)}return null}function J(S){let l=e.chatHistory.findIndex(_=>_.jobId===S.id);if(l<0)return;S.status==="running"?(e.chatHistory[l].pending=!0,e.chatHistory[l].pendingLabel=S.phase||"Agent working\u2026"):(e.chatHistory[l].pending=!1,e.chatHistory[l].text=S.result||S.error||"(no response)",e.chatHistory[l].artifacts=S.artifacts||[],S.session_id&&e.setChatSessionId(S.session_id));let m=e.$("#chat-messages");m&&e.currentView==="chat"&&(m.innerHTML=e.renderChatMessagesInner(),window.FOSMarkdown?.enhance?.(m),e.initMsgReadMore(m),m.scrollTop=m.scrollHeight),e.updateLiveStrip({active:S.status==="running",phase:S.phase}),e.$$("#chat-live-panel-phase, [id$='-phase']").forEach(_=>{_&&(_.textContent=S.phase||"Idle")})}function ee(){return e.chatHistory.length?e.chatHistory.map((l,m)=>l.pending?`<div class="msg ${l.role} is-pending"><div class="msg-bubble">${e.renderMessageHtml(l)}</div></div>`:`<div class="msg ${l.role}">
        <div class="msg-bubble msg-read-more-host" data-msg-scope="chat" data-msg-index="${m}">
          ${e.renderMessageHtml(l)}
          <button type="button" class="msg-read-more" hidden>Read more</button>
        </div>
      </div>`).join(""):""}async function P(S,{direct:l=!1,specId:m=""}={}){let _=e.chatPayload({message:S});l&&m&&(_.specialist=m);let k=await e.api("/chat/async",{method:"POST",body:JSON.stringify(_),timeoutMs:2e4});e.state._chatAttachments=[];let O=k.job;e.chatHistory.push({role:"agent",text:"",pending:!0,jobId:O.id,pendingLabel:O.phase||"Starting\u2026"}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.state._activeJob=O,e.render(),e.startLivePoll();try{let d=await e.pollAgentJob(O.id);d?.job?.session_id&&e.setChatSessionId(d.job.session_id),d?.pending_approvals&&(e.state.approvals=d.pending_approvals,e.updateBadges()),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.loadChatSessionsList()}finally{e.state._activeJob=null,e.pollLive(),e.currentView==="chat"&&e.render()}}async function E(S){let l=S||e.state._activeJob?.id;if(l)try{await e.api(`/chat/jobs/${encodeURIComponent(l)}/cancel`,{method:"POST",timeoutMs:1e4}),e.state._activeJob?.id===l?await e.pollAgentJob(l):e.pollLive()}catch(m){alert(m.message)}}function B(){let S=e.state._agents||{},l=e.routingMeta(S),m=e.routingLabel(S),_=e.isDirectSpecialist(),k=e.listSpecialists(S),O=e.state.ragMode||"auto",d=e.RAG_MODES.find(M=>M.id===O)||e.RAG_MODES[0],p=e.renderChatMessagesInner(),$=e.state.live||{},D=!e.chatHistory.length,T=!!e.state._activeJob?.active||e.chatHistory.some(M=>M.pending),V=e.collectAgentRuns().slice(0,4);return`<div class="chat-shell">
      <header class="chat-header driver-card">
        <div>
          <p class="section-eyebrow">Optional \xB7 agent assist</p>
          <h2 class="title-md">Ask agent</h2>
        </div>
        <div class="chat-header__meta">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          <span class="badge-pill agent-routing-badge">${e.esc(m)}</span>
          ${T?'<span class="badge-pill badge-pill--alert">Working</span>':""}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents">Change specialist</button>
        </div>
      </header>
      ${e.renderChatSessionsList()}
      <div class="chat-layout chat-layout--rich">
        <div class="chat-wrap">
          <div class="chat-messages${D?" is-empty":""}" id="chat-messages">
            ${D?`<div class="chat-empty">
              <p class="title-md">Supervisor ready</p>
              <p class="body-md">Routing: <strong>${e.esc(m)}</strong> \xB7 Retrieval: <strong>${e.esc(d.label)}</strong></p>
              <div class="capability-strip chat-empty__chips">
                <button type="button" class="delegate-hint" data-goto="crm">CRM</button>
                <button type="button" class="delegate-hint" data-goto="goals">Goals</button>
                <button type="button" class="delegate-hint" data-goto="world">Vault / Worlds</button>
                <button type="button" class="delegate-hint" data-goto="documents">Documents</button>
                <button type="button" class="delegate-hint" data-goto="agents">Agents</button>
              </div>
            </div>`:p}
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
              <textarea class="text-input-on-dark chat-input" id="chat-input" placeholder="${_?`Task for ${e.esc(l.label)}\u2026`:"Message supervisor\u2026"}" rows="3"${T?" disabled":""}></textarea>
              <button class="button-primary" id="chat-send"${T?" disabled":""}>${_?`Run ${e.esc(l.label)}`:"Send"}</button>
            </div>
            <div class="chat-toolbar">
              <label class="button-outline-on-dark button-sm upload-label">Upload<input type="file" id="chat-file" hidden accept=".pdf,.docx,.txt,.md,.csv,.json"></label>
              <button type="button" class="button-outline-on-dark button-sm" data-open-vault-picker>Attach vault</button>
              <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New chat</button>
              ${T?'<button type="button" class="button-outline-on-dark button-sm" data-cancel-active-job>Stop</button>':""}
              <button type="button" class="button-outline-on-dark button-sm" data-goto="world">Worlds</button>
            </div>
          </div>
          <section class="driver-card chat-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-chat" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </div>
        <aside class="chat-rail">
          ${e.renderLivePanel($,"chat-live-panel")}
          <section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Specialists</p>
            <div class="specialist-chips" style="margin-top:var(--space-xxs)">${k.map(M=>`<span class="specialist-chip${e.currentSpecialistId()===M.id?" is-selected":""}${e.agentBusy($,M.id)?" is-busy":""}">${e.esc(M.label)}</span>`).join("")}</div>
          </section>
          ${V.length?`<section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Recent runs</p>
            <div class="activity-timeline">${V.map(M=>`<div class="activity-timeline__row"><span>${e.esc((M.agent||"").toUpperCase())}</span><span class="muted">${e.esc((M.task||"").slice(0,40))}</span></div>`).join("")}</div>
          </section>`:""}
        </aside>
      </div>
    </div>`}function q(){requestAnimationFrame(()=>{let S=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),l=S?.[S.length-1];FOSMotion?.animateNewMessage?.(l)})}async function X(){try{await e.api("/auth/logout",{method:"POST",body:"{}"})}catch{}e.showPinGate()}async function se(){let S=e.$("#chat-input"),l=(S?.value||"").trim();if(!l||e.chatHistory.some(p=>p.pending))return;let m=e.currentSpecialistId(),_=e.routingMeta(e.state._agents||{}),k=!!m;S.value="",e.chatHistory.push({role:"user",text:l}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render(),e.animateLatestChatMessage();let O=e.$("#chat-send"),d=k?`Run ${_.label}`:"Send";O&&(O.disabled=!0,O.textContent="\u2026");try{await e.startAgentJob(l,{direct:k,specId:m})}catch(p){e.chatHistory.push({role:"system",text:"Error: "+p.message}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render()}O&&(O.disabled=!1,O.textContent=d),e.animateLatestChatMessage()}async function te(){let S=!e.state.config?.agent_paused;await e.api("/agent/pause",{method:"POST",body:JSON.stringify({paused:S})}),await e.refresh(),e.render()}e.chatSessionId=L,e.setChatSessionId=I,e.applyChatSessionResponse=v,e.loadChatFromServer=t,e.chatPayload=f,e.renderMessageHtml=h,e.msgExpandKey=g,e.msgReadLineLimit=o,e.initMsgReadMore=a,e.renderArtifactLinks=s,e.loadChatSessionsList=c,e.renderChatSessionsList=r,e.openMdEditor=b,e.renderChatAttachmentChips=R,e.openVaultAttachPicker=C,e.pollAgentJob=A,e.patchChatJobBubble=J,e.renderChatMessagesInner=ee,e.startAgentJob=P,e.cancelActiveJob=E,e.renderChat=B,e.animateLatestChatMessage=q,e.logoutPin=X,e.sendChat=se,e.togglePause=te}function ve(e){function L(a){a!=null&&(e.state._documentsSelectedId=Number(a)),e.goView("documents")}function I(){let a=e.state._artifacts||[],s=e.state._documentsSelectedId,c=a.find(A=>A.id===s),r=e.state._documentDraft??"",b=e.documentsEditMode,R=a.length?a.map(A=>`
      <button type="button" class="docs-list-item${A.id===s?" is-active":""}" data-select-document="${A.id}">
        <span class="badge-pill">${e.esc(A.kind||"md")}</span>
        <span class="docs-list-item__title">${e.esc(A.title||"Untitled")}</span>
        <span class="docs-list-item__meta muted">${e.fmtHistoryTime(A.created_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No documents yet. Create one or upload a file.</p>",C=`<div class="docs-empty">
      <p class="title-sm">Document workspace</p>
      <p class="body-md muted">Select a document from the list, or create a new markdown file.</p>
      <button type="button" class="button-primary button-sm" data-docs-action="new">+ New document</button>
    </div>`;return c&&(C=`
        <div class="docs-editor__toolbar">
          <input type="text" class="text-input-on-dark docs-title-input" id="docs-title-input" value="${e.esc(c.title||"Untitled")}" aria-label="Document title">
          <select class="text-input-on-dark field-select docs-world-select" id="docs-world-select" aria-label="Project">
            ${e.renderWorldOptionsForDocs(c.world_id||"root")}
          </select>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="toggle">${b?"Preview":"Edit"}</button>
          <button type="button" class="button-primary button-sm" data-docs-action="save">Save</button>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="memory">Save to memory</button>
        </div>
        <div class="docs-editor__body">
          ${b?`<textarea id="docs-source" class="docs-source text-input-on-dark" aria-label="Document source">${e.esc(r)}</textarea>`:'<div id="docs-preview" class="md-content msg-md docs-preview"></div>'}
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
          <div class="docs-list">${R}</div>
        </aside>
        <section class="driver-card docs-editor-panel">${C}</section>
      </div>`}async function v(){let a=prompt("Document title","Untitled");if(!a)return;let s=e.currentWorldId(),c=await e.api("/artifacts",{method:"POST",body:JSON.stringify({title:a,content:`# ${a}

`,world_id:s&&s!=="root"?s:null}),timeoutMs:15e3});e.state._documentsSelectedId=c.artifact?.id,e.documentsEditMode=!0,await e.loadViewData("documents"),e.render()}async function t(a){if(!a)return;let s=new FormData;s.append("file",a);let c=e.currentWorldId();c&&c!=="root"&&s.append("world_id",c);let r=await e.apiUpload("/artifacts",s);e.state._documentsSelectedId=r.artifact?.id,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function f(){let a=e.state._documentsSelectedId;if(!a)return;let s=document.getElementById("docs-source")?.value??e.state._documentDraft??"",c=document.getElementById("docs-title-input")?.value??"Untitled",r=document.getElementById("docs-world-select")?.value??"root";await e.api(`/artifacts/${a}/content`,{method:"PUT",body:JSON.stringify({content:s}),timeoutMs:15e3}),await e.api(`/artifacts/${a}`,{method:"PATCH",body:JSON.stringify({title:c,world_id:r==="root"?null:r}),timeoutMs:15e3}),e.state._documentDraft=s,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function h(){let a=e.state._documentsSelectedId;if(!a)return;e.documentsEditMode&&await e.saveCurrentDocument();let s=await e.api(`/artifacts/${a}/memory`,{method:"POST",body:"{}",timeoutMs:2e4});alert(`Saved to memory (${s.collection||"documents"}).`)}async function g(a){e.state._documentsSelectedId=Number(a),e.documentsEditMode=!1;try{let s=await e.api(`/artifacts/${a}/content`,{timeoutMs:15e3});e.state._documentDraft=s.content||""}catch(s){e.state._documentDraft="",alert(s.message||"Could not load document")}e.render()}function o(a){let s=(a||"").toLowerCase();return s.endsWith(".md")||s.endsWith(".markdown")||s.endsWith(".rst")}e.openDocumentsWorkspace=L,e.renderDocuments=I,e.createNewDocument=v,e.uploadDocumentFile=t,e.saveCurrentDocument=f,e.saveDocumentToMemory=h,e.selectDocument=g,e.isMarkdownFilename=o}function ye(e){function L(l){let m=l?.supervisor||{};return{id:"supervisor",label:"Supervisor",role:"aggregator",tool_count:l?.total_tools,brief:m.role||"Orchestrates specialists \u2014 picks who to run when routing is Auto"}}function I(l){let m=l?.specialists||[];return(m.length?m:e.DEFAULT_SPECIALISTS).map(k=>({...k,label:k.label||k.id}))}function v(){let l=e.listSpecialists(e.state._agents||{}),m=e.state.selectedSpecialist??"";m&&!l.some(p=>p.id===m)&&(m=""),e.state.selectedSpecialist=m;let k=`<option value="">Auto \u2014 supervisor decides</option>${l.map(p=>`<option value="${e.esc(p.id)}">${e.esc(p.label)}</option>`).join("")}`,O=e.$("#specialist-select-agents");O&&(O.innerHTML=k,O.value=m);let d=e.$("#chat-specialist-select");d&&(d.innerHTML=k,d.value=m)}function t(l){let m=e.currentSpecialistId();return m?`Supervisor \u2192 ${e.listSpecialists(l||e.state._agents||{}).find(k=>k.id===m)?.label||m}`:"Supervisor \xB7 auto-route"}function f(l){let m=e.state._agents||l||{},_=e.currentSpecialistId();return _?e.listSpecialists(m).find(k=>k.id===_)||{id:_,label:_,role:"specialist"}:e.supervisorMeta(m)}function h(l,m){let _=l?.jobs||[],k=String(m||"");if(_.some(d=>d.status==="running"&&(d.specialist===k||k==="supervisor"&&d.mode==="chat")))return!0;let O=l?.active?String(l.actor||""):"";return k==="supervisor"?O==="user":O===`subagent:${k}`||k&&O.includes(k)}function g(l){let m=e.AGENT_ROLES[l]||{label:l||"Specialist",cls:""};return`<span class="agent-role-badge ${m.cls}">${e.esc(m.label)}</span>`}function o(l,m){let _=e.AGENT_ROLES[m]||e.AGENT_ROLES.aggregator,k=e.AGENT_INITIALS[l]||(l||"??").slice(0,2).toUpperCase();return`<span class="agent-avatar ${_.avatar||"agent-avatar--aggregator"}" aria-hidden="true">${e.esc(k)}</span>`}function a(l,m){let _=(m||[]).find(O=>O.agent===l);return _?.ts?new Date(typeof _.ts=="number"&&_.ts<1e12?_.ts*1e3:_.ts).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function s(){let l=e.state._agentRunsApi||[],_=[...e.readJsonStorage("fos_agent_runs",[])];for(let k of l)_.some(O=>O.id===k.id)||_.push({...k,source:"trace"});return _.sort((k,O)=>(O.ts||0)-(k.ts||0)),_.slice(0,50)}function c(l){let m=e.readJsonStorage("fos_agent_runs",[]);m.unshift(l),localStorage.setItem("fos_agent_runs",JSON.stringify(m.slice(0,50)))}function r(l){let m=!e.currentSpecialistId();return`<button type="button" class="fleet-card fleet-card--auto${m?" is-selected":""}" data-select-specialist="" aria-pressed="${m}">
      ${m?'<span class="fleet-card__active-label">Routing</span>':""}
      <div class="fleet-card__top">
        <span class="agent-avatar agent-avatar--aggregator" aria-hidden="true">AU</span>
        <span class="fleet-card__status" title="Supervisor routes"></span>
      </div>
      <div class="fleet-card__name">Auto</div>
      <span class="agent-role-badge agent-role--aggregator">Supervisor picks</span>
      <div class="fleet-card__meta"><span>Default routing</span></div>
    </button>`}function b(l,m){let _=e.supervisorMeta(l),k=e.agentBusy(m,"supervisor");return`<div class="supervisor-banner driver-card">
      <div class="agent-card-title-row">
        ${e.agentAvatar("supervisor",_.role)}
        <div>
          <h2 class="title-md">${e.esc(_.label)} <span class="supervisor-main-tag">Main agent</span></h2>
          <p class="world-meta">${e.esc((_.brief||"").slice(0,140))}</p>
        </div>
      </div>
      <span class="agent-status ${k?"busy":"ready"}">${k?"Working":"Always on"}</span>
    </div>`}function R(l,m,_,k){let O=e.agentBusy(m,l.id),d=_===l.id,p=e.lastRunForAgent(l.id,k);return`<button type="button" class="fleet-card${O?" is-busy":""}${d?" is-selected":""}" data-select-specialist="${e.esc(l.id)}" aria-pressed="${d}">
      ${d?'<span class="fleet-card__active-label">Direct</span>':""}
      <div class="fleet-card__top">
        ${e.agentAvatar(l.id,l.role)}
        <span class="fleet-card__status ${O?"is-busy":""}" title="${O?"Working":"Idle"}"></span>
      </div>
      <div class="fleet-card__name">${e.esc(l.label)}</div>
      ${l.role?e.agentRoleBadge(l.role):""}
      <p class="fleet-card__brief">${e.esc((l.brief||"").slice(0,72))}</p>
      <div class="fleet-card__meta">
        <span>${l.tool_count??"\u2014"} tools</span>
        ${p?`<span>${e.esc(p)}</span>`:""}
      </div>
    </button>`}function C(l,m,_=!1){let k=e.listSpecialists(l),O=e.currentSpecialistId(),d=e.collectAgentRuns();return _?`<div class="fleet-rail">${e.renderFleetAutoCard(m)}${k.map(p=>e.renderFleetCard(p,m,O,d)).join("")}</div>`:`<div class="agent-grid">${k.map(p=>{let $={...p,label:p.label||p.id};return`<article class="agent-card${e.agentBusy(m,p.id)?" is-busy":""}">
          <div class="agent-card-head">${e.renderFleetCardInner($,m,d)}</div>
        </article>`}).join("")}</div>`}function A(l,m,_){let k=e.agentBusy(m,l.id),O=e.lastRunForAgent(l.id,_);return`
      <div class="agent-card-title-row">
        ${e.agentAvatar(l.id,l.role)}
        <div><h3>${e.esc(l.label)}</h3>${l.role?e.agentRoleBadge(l.role):""}</div>
      </div>
      <span class="agent-status ${k?"busy":"ready"}">${k?"Working":"Ready"}</span>
      <p class="agent-meta">${l.tool_count??0} tools${O?` \xB7 ${e.esc(O)}`:""}</p>`}function J(l){return l.length?`<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Time</th><th>Agent</th><th>Task</th><th>Duration</th><th>Tools</th><th></th></tr></thead>
      <tbody>${l.map(m=>{let _=m.ts?e.fmtTime(m.ts):"\u2014",k=(m.tools||[]).slice(0,4).join(", "),O=e.state.expandedRunId===m.id;return`<tr class="data-row${O?" is-expanded":""}" data-run-id="${e.esc(m.id)}">
          <td class="mono muted">${e.esc(_)}</td>
          <td><span class="fleet-inline-badge">${e.esc((m.agent||"").toUpperCase())}</span></td>
          <td class="task-cell">${e.esc((m.task||"").slice(0,120))}</td>
          <td class="mono">${m.duration_s?`${m.duration_s}s`:"\u2014"}</td>
          <td class="muted">${e.esc(k||"\u2014")}</td>
          <td><button type="button" class="button-tertiary-text button-sm" data-toggle-run="${e.esc(m.id)}">${O?"Hide":"View"}</button></td>
        </tr>
        ${O?`<tr class="data-row-detail"><td colspan="6"><pre class="run-result mono">${e.esc(m.result||"No output recorded")}</pre></td></tr>`:""}`}).join("")}</tbody>
    </table></div>`:'<div class="empty-state"><p class="title-sm">No specialist runs yet</p></div>'}function ee(){let l=e.state._tools||{},m=l.by_category||{};return`<div class="console-split">
      <div class="driver-card">${Object.entries(m).sort((k,O)=>O[1]-k[1]).map(([k,O])=>`<div class="kv-row"><span class="k">${e.esc(k)}</span><span class="v">${O}</span></div>`).join("")||"<p class='muted'>No tools loaded</p>"}</div>
      <div class="driver-card tool-list-compact">${(l.tools||[]).slice(0,24).map(k=>`<div class="tool-chip">${e.esc(k.name)}${k.requires_approval?'<span class="badge-pill">approval</span>':""}</div>`).join("")}</div>
    </div>`}function P(){let l=e.state._crm||{},m=l.pipeline||{},_=l.contacts||[],k=l.followups_due||[],O=Object.entries(m).map(([$,D])=>`<div class="kv-row"><span class="k">${e.esc($)}</span><span class="v">${D}</span></div>`).join(""),d=k.slice(0,8).map($=>`<li>${e.esc($.name)} <span class="muted">${e.esc($.company||"")}</span></li>`).join("")||"<li class='muted'>None due</li>",p=_.slice(0,10).map($=>`<tr><td>${e.esc($.name)}</td><td>${e.esc($.company||"\u2014")}</td><td>${e.esc($.status||"\u2014")}</td></tr>`).join("");return`<div class="console-split">
      <section class="driver-card"><p class="caption-uppercase">Pipeline</p>${O||"<p class='muted'>Empty</p>"}
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Follow-ups due</p><ul class="list-plain">${d}</ul></section>
      <section class="driver-card"><p class="caption-uppercase">Contacts (${_.length})</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Company</th><th>Status</th></tr></thead>
        <tbody>${p||"<tr><td colspan='3' class='muted'>No contacts</td></tr>"}</tbody></table></div>
        <button type="button" class="button-outline-on-dark button-sm" data-goto="crm" style="margin-top:var(--space-xs)">Open CRM</button>
      </section>
    </div>`}function E(){let l=e.currentWorldId(),m=e.vaultReadyFor(l)?e.vaultPayload()||{}:{},_=m.folders||m.facets||[],k=e.state._agentsVaultQ||"",O=l!=="root"&&!e.vaultReadyFor(l);return`<div class="console-split">
      <section class="driver-card">
        <p class="caption-uppercase">Vault \xB7 ${e.esc(e.activeWorldLabel())}</p>
        ${O?"<p class='body-md muted' style='margin-top:var(--space-xs)'>Loading vault registry\u2026</p>":`<div class="vault-facet-grid" style="margin-top:var(--space-xs)">${_.map(d=>`<div class="vault-facet-card"><div class="vault-facet-head"><h4>${e.esc(d.domain_label||d.label||d.folder||"")}</h4><span class="badge-pill">${d.file_count??0} files</span></div></div>`).join("")||"<p class='muted'>Select a sub-world or link a repo in Worlds</p>"}</div>`}
        <button type="button" class="button-outline-on-dark button-sm" data-goto="world" style="margin-top:var(--space-sm)">Manage vault</button>
      </section>
      <section class="driver-card">
        <div class="search-row">
          <input type="search" class="text-input-on-dark" id="agents-vault-q" placeholder="Search vault\u2026" value="${e.esc(k)}">
          <button type="button" class="button-primary button-sm" id="agents-vault-search">Search</button>
        </div>
        <pre class="run-result mono" id="agents-vault-results" hidden></pre>
      </section>
    </div>`}function B(){let l=e.state.agentsTab||"runs",m=e.collectAgentRuns();if(l==="runs")return e.renderAgentRunsTable(m);if(l==="live"){let _=e.state.live||{};return e.renderLivePanel(_,"agents-tab-live")}return l==="tools"?e.renderAgentsToolsPanel():l==="crm"?e.renderAgentsCrmPanel():l==="vault"?e.renderAgentsVaultPanel():""}function q(){let l=e.state._agents||{},m=e.state.live||l.live||{},_=e.routingMeta(l),k=e.routingLabel(l),O=e.isDirectSpecialist(),d=e.state._delegateDraft||"",p=e.collectAgentRuns(),$=(e.state.approvals||[]).length,D=(l.specialists||[]).filter(F=>e.agentBusy(m,F.id)).length,T=l.skills||[],V=e.state.agentsTab||"runs",M=!!(e.state._delegateResult||"").trim(),Q=e.state._agentActions||[];return`<div class="agents-console">
      <header class="console-toolbar driver-card">
        <div class="console-kpis">
          <div class="console-kpi"><span class="console-kpi__val">${l.specialists?.length||5}</span><span class="console-kpi__lbl">Specialists</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${D||"0"}</span><span class="console-kpi__lbl">Active</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${p.length}</span><span class="console-kpi__lbl">Runs</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${l.total_tools||0}</span><span class="console-kpi__lbl">Tools</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${$}</span><span class="console-kpi__lbl">Approvals</span></div>
        </div>
        <div class="console-toolbar__actions">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          ${T.map(F=>`<span class="skill-chip${F.installed?"":" is-missing"}">${e.esc(F.name)}</span>`).join("")}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="approvals"${$?"":" disabled"}>Approvals${$?` (${$})`:""}</button>
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
          <span class="badge-pill agent-routing-badge">${e.esc(k)}</span>
        </div>
        <div class="agent-picker-bar__cards">${e.renderAgentCards(l,m,!0)}</div>
      </section>
  
      <div class="agents-workspace">
        <section class="task-composer driver-card">
          <div class="task-composer__head">
            <div class="agent-card-title-row">
              ${e.agentAvatar(O?_.id:"supervisor",O?_.role:"aggregator")}
              <div>
                <h2 class="title-md">${O?e.esc(_.label):"Supervisor"}</h2>
                <p class="world-meta">${O?e.esc((_.brief||"").slice(0,100)):"Auto-route \u2014 supervisor will delegate to the best specialist"}</p>
              </div>
            </div>
            <span class="agent-status ${e.agentBusy(m,O?_.id:"supervisor")?"busy":"ready"}">${e.esc(k)}</span>
          </div>
          <textarea class="text-input-on-dark task-composer__input" id="delegate-selected" rows="3" placeholder="${O?`Task for ${e.esc(_.label)}\u2026`:"Message supervisor\u2026"}">${e.esc(d)}</textarea>
          <div class="task-composer__foot">
            <button type="button" class="button-primary" id="delegate-selected-btn">${O?`Run ${e.esc(_.label)}`:"Send to supervisor"}</button>
            <span class="world-meta mono" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          </div>
          ${M?`<div class="delegate-result-wrap msg-read-more-host driver-card" data-msg-scope="agents-delegate" data-msg-index="0">
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
          <div class="action-feed">${Q.slice(0,8).map(F=>`<div class="action-feed__item"><span class="mono">${e.esc(F.tool_name)}</span><span class="muted">${e.esc((F.created_at||"").slice(11,16))}</span></div>`).join("")||"<p class='muted'>No actions yet</p>"}</div>
        </aside>
      </div>
  
      <section class="driver-card agents-panel">
        <div class="workspace-tabs">
          <button type="button" class="workspace-tab${V==="runs"?" is-active":""}" data-agents-tab="runs">Run history</button>
          <button type="button" class="workspace-tab${V==="live"?" is-active":""}" data-agents-tab="live">Live runtime</button>
          <button type="button" class="workspace-tab${V==="tools"?" is-active":""}" data-agents-tab="tools">Tools</button>
          <button type="button" class="workspace-tab${V==="crm"?" is-active":""}" data-agents-tab="crm">CRM</button>
          <button type="button" class="workspace-tab${V==="vault"?" is-active":""}" data-agents-tab="vault">Vault</button>
        </div>
        <div class="agents-tab-body">${e.renderAgentsTabPanel()}</div>
      </section>
    </div>`}function X(){if(e.currentView!=="agents"||e.state.agentsTab!=="vault")return;let l=document.querySelector(".agents-console .console-split");l&&(l.outerHTML=e.renderAgentsVaultPanel())}function se(l){let m=l||"";e.state.selectedSpecialist=m,localStorage.setItem("fos_selected_specialist",m),e.populateSpecialistSelect(),e.render()}async function te(){let l=e.$("#agents-vault-q")?.value?.trim();e.state._agentsVaultQ=l;let m=e.$("#agents-vault-results"),_=e.currentWorldId();if(!(!l||!_||_==="root"))try{let O=((await e.api(`/vault/search?${new URLSearchParams({q:l,world_id:_})}`)).hits||[]).map(d=>`[${d.metadata?.domain||"?"}] ${d.metadata?.source||""}
${(d.text||"").slice(0,240)}`).join(`

---

`)||"No hits.";m&&(m.textContent=O,m.hidden=!1)}catch(k){m&&(m.textContent=k.message,m.hidden=!1)}}async function S(){let l=e.currentSpecialistId(),m=e.$("#delegate-selected"),_=(m?.value||"").trim();if(!_)return;let k=e.$("#delegate-selected-btn"),O=e.routingMeta(e.state._agents||{}),d=!!l,p=Date.now();k&&(k.disabled=!0,k.textContent="Running\u2026"),e.startLivePoll(),e.state.agentsTab="live",localStorage.setItem("fos_agents_tab","live"),e.state._delegateResult="Agent working\u2026",e.render();try{let $=await e.api("/chat/async",{method:"POST",body:JSON.stringify(e.chatPayload({message:_,specialist:d?l:void 0})),timeoutMs:2e4}),D=await e.pollAgentJob($.job.id),T=D?.job,V=T?.result||T?.error||"(no response)";e.state._delegateResult=V,e.state._delegateDraft="",m&&(m.value=""),T?.session_id&&e.setChatSessionId(T.session_id),e.persistAgentRun({id:T?.run_id||`local-${p}`,agent:d?l:"supervisor",task:_,result:V,duration_s:T?.elapsed_s||Math.round((Date.now()-p)/1e3),ts:Math.floor(p/1e3),tools:(T?.events||[]).filter(M=>M.name).map(M=>M.name),source:"delegate",artifacts:T?.artifacts}),e.state.agentsTab="runs",localStorage.setItem("fos_agents_tab","runs"),e.state.expandedRunId=T?.run_id||`local-${p}`,D?.pending_approvals&&(e.state.approvals=D.pending_approvals,e.updateBadges())}catch($){e.state._delegateResult="Error: "+$.message}k&&(k.disabled=!1,k.textContent=d?`Run ${O.label}`:"Send to supervisor");try{let $=await e.api("/agents/runs");e.state._agentRunsApi=$.runs||[],e.state._agentActions=$.actions||[]}catch{}e.state._activeJob=null,e.pollLive(),e.render(),e.drawGraphs()}e.supervisorMeta=L,e.listSpecialists=I,e.populateSpecialistSelect=v,e.routingLabel=t,e.routingMeta=f,e.agentBusy=h,e.agentRoleBadge=g,e.agentAvatar=o,e.lastRunForAgent=a,e.collectAgentRuns=s,e.persistAgentRun=c,e.renderFleetAutoCard=r,e.renderSupervisorBanner=b,e.renderFleetCard=R,e.renderAgentCards=C,e.renderFleetCardInner=A,e.renderAgentRunsTable=J,e.renderAgentsToolsPanel=ee,e.renderAgentsCrmPanel=P,e.renderAgentsVaultPanel=E,e.renderAgentsTabPanel=B,e.renderAgents=q,e.patchAgentsVaultPanel=X,e.selectSpecialist=se,e.agentsVaultSearch=te,e.delegateAgent=S}function we(e){function L(n){let i=e.state.worlds||e.state._worldFull?.worlds||{},u=i.root,y=i.children||[],w=n||"",G=`<option value="root"${w==="root"||!w?" selected":""}>${e.esc(u?.name||"Main world")}</option>`;return G+=y.map(j=>`<option value="${e.esc(j.id)}"${w===j.id?" selected":""}>${e.esc(j.name)} \xB7 ${e.esc(j.kind||"project")}</option>`).join(""),G}function I(n,i){let u=n?.facets||n?.folders||[],y=[];for(let w of u)for(let G of w.documents||[])G.github_repo===i&&y.push(G);return y.sort((w,G)=>(w.github_path||w.filename||"").localeCompare(G.github_path||G.filename||""))}function v(n){let i=n.filter(u=>{let y=u.github_path||u.filename||"";return/^readme\.md$/i.test(y.split("/").pop()||"")});return i.length?i.sort((u,y)=>(u.github_path||u.filename||"").length-(y.github_path||y.filename||"").length)[0]:null}function t(n){let i=(n.files||[]).length;for(let u of Object.keys(n.dirs||{}))i+=e.countGithubTreeFiles(n.dirs[u]);return i}function f(n,i,u=0){let y=Object.keys(n.dirs||{}).sort(),w=(n.files||[]).sort((j,U)=>j._fileName.localeCompare(U._fileName)),G="";for(let j of y){let U=n.dirs[j],K=e.countGithubTreeFiles(U);G+=`<details class="github-tree-dir"${u<2?" open":""}>
        <summary><span class="mono">${e.esc(j)}</span> <span class="muted">${K} file${K!==1?"s":""}</span></summary>
        <div class="github-tree">${e.renderGithubTreeNode(U,i,u+1)}</div>
      </details>`}for(let j of w){let U=j.github_path||j.filename||j.title,K=/^readme\.md$/i.test((U||"").split("/").pop()||"");G+=`<div class="github-tree-file">
        <span class="github-tree-file__path mono${K?" is-readme":""}">${e.esc(U)}</span>
        <span class="github-tree-file__actions">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-view-doc="${j.id}" data-world-id="${e.esc(i)}" data-doc-title="${e.esc(j.title||U)}">View</button>
          <button type="button" class="button-primary button-sm" data-tag-vault-doc="${j.id}" data-world-id="${e.esc(i)}" data-doc-title="${e.esc(j.title||U)}" data-doc-path="${e.esc(U)}">Tag in agent</button>
        </span>
      </div>`}return G}function h(n,i,u,y){e.state._chatAttachments||(e.state._chatAttachments=[]);let w=Number(n);e.state._chatAttachments.some(G=>G.doc_id===w)||e.state._chatAttachments.push({type:"vault",doc_id:w,title:u||y||"Document",path:y||"",world_id:i}),e.goView("chat")}function g(n,i){if(n?.nodes&&n?.edges)return n;let u=n?.vault||n||{},y=i||{},w=[],G=[],j=y.id||u.world_id||"world",U=`vault-world:${j}`;return w.push({data:{id:U,label:(y.name||"World").slice(0,36),type:"world_root",world_id:j}}),(u.facets||u.folders||[]).forEach(W=>{let z=W.id||W.folder||"slot",N=`vault-facet:${j}:${z}`,x=`${W.label||W.folder||"Folder"} (${W.file_count||0})`;w.push({data:{id:N,label:x.slice(0,40),type:"vault_facet",facet_id:z,folder:W.folder}}),G.push({data:{source:U,target:N,label:"folder"}}),(W.documents||[]).slice(0,14).forEach((Y,Z)=>{let ae=`vault-doc:${Y.id||Z}`;w.push({data:{id:ae,label:(Y.title||Y.filename||"Document").slice(0,36),type:"vault_file",doc_id:Y.id,facet_id:z,source:Y.source_type||"upload"}}),G.push({data:{source:N,target:ae,label:"doc"}})}),(W.files||[]).slice(0,8).forEach((Y,Z)=>{let ae=`vault-disk:${j}:${z}:${Z}`;w.push({data:{id:ae,label:(Y.name||Y.relative||"file").slice(0,32),type:"vault_file",path:Y.relative,facet_id:z,source:"disk"}}),G.push({data:{source:N,target:ae,label:"disk"}})})}),(u.github_repos||[]).slice(0,10).forEach(W=>{let z=`gh-repo:${W.id}`;w.push({data:{id:z,label:(W.full_name||"repo").split("/").pop().slice(0,28),type:"vault_repo",link_id:W.id,repo:W.full_name}}),G.push({data:{source:U,target:z,label:"github"}})}),w.length<=1&&(w.push({data:{id:"vault-empty",label:"Add docs or link GitHub",type:"empty"}}),G.push({data:{source:U,target:"vault-empty",label:"start"}})),{nodes:w,edges:G}}function o(n){let i=n?.id;if(!i||i==="root")return{nodes:[],edges:[]};if(e.state._vaultLoading&&e.state._vaultWorldId!==i)return{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]};if(e.state._vaultWorldId===i&&e.state._vaultGraph?.nodes?.length)return e.state._vaultGraph;let u=e.vaultReadyFor(i)?e.vaultPayload():null;return u?e.buildVaultGraph(u,n):e.state._vaultLoading?{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]}:{nodes:[{data:{id:"vault-empty",label:"Vault not loaded",type:"empty"}}],edges:[]}}function a(n){return n==="vault"?`
        <span><i style="border-color:#051f13"></i> World</span>
        <span><i style="border-color:#00666b"></i> Folder</span>
        <span><i style="border-color:#8f706b;border-radius:50%"></i> File</span>
        <span><i style="border-color:#f75440;background:#2d312e"></i> GitHub</span>`:`
      <span><i style="border-color:#051f13"></i> Main</span>
      <span><i style="border-color:#f75440"></i> Project</span>
      <span><i style="border-color:#ffb4a8"></i> Idea</span>
      <span><i style="border-color:#00666b"></i> Research</span>
      <span><i style="border-color:#f75440;background:#f7544033"></i> Active</span>`}function s(n="world-create-form"){return`
      <form class="world-form human-form" id="${e.esc(n)}">
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
      </form>`}function c(n){let i=e.worldTreeData(),u=n||"root";return u==="root"||u===i.root?.id?i.root||null:(i.children||[]).find(y=>y.id===u)||null}function r(){return e.state.inspectorWorldId||e.currentWorldId()||"root"}async function b(n,{force:i=!1}={}){if(!n||n==="root"){e.clearVaultScopedState(),e.invalidateGraphCache("graph-world");return}if(!i&&e.vaultReadyFor(n))return;let u=++e.vaultLoadGen;e.state._vaultLoading=!0,e.state._vaultWorldId=n,e.currentView==="world"&&e.patchWorldPanels();try{let y=await e.api(`/worlds/${encodeURIComponent(n)}/vault`);if(u!==e.vaultLoadGen)return;e.state._worldVault=y.vault||null,e.state._vaultGraph=y.vault_graph||null,e.state._vaultWorldId=n,e.invalidateGraphCache("graph-world")}catch{if(u!==e.vaultLoadGen)return;e.clearVaultScopedState()}finally{u===e.vaultLoadGen&&(e.state._vaultLoading=!1)}}async function R(n,i={}){if(!n||n==="root"){e.clearVaultScopedState();return}i.force&&(e.state._vaultWorldId=null),await e.loadWorldVault(n,{force:!0})}async function C(){try{let n=await e.api("/graph/world");e.state._worldFull=n,e.state._worldGraph=n?.graph??null,e.state._worldHierarchyGraph=n?.hierarchy_graph??null,e.state._worldPreviews=n?.world_previews??{},n?.worlds&&(e.state.worlds=n.worlds),e.populateWorldSelect(),e.invalidateGraphCache("graph-world")}catch(n){console.warn("world tree reload failed:",n)}}async function A(n,i={}){if(!n||n==="root"){e.clearVaultScopedState();return}!i.force&&e.vaultReadyFor(n)||await e.loadWorldVault(n,{force:!!i.force})}function J(){let n=e.inspectorWorldId(),i=e.state.activeWorldId||"root";e.$$("[data-inspect-world]").forEach(y=>{let w=y.dataset.inspectWorld;y.classList.toggle("is-inspect",w===n),y.classList.toggle("is-active",w===i)});let u=document.querySelector(".worlds-stat [data-active-world-label]");u&&(u.textContent=e.activeWorldLabel())}function ee(){if(e.currentView!=="world")return;let n=e.inspectorWorldId(),i=e.worldById(n),u=e.state._worldFull?.snapshot||e.state.snapshot||{},y=document.getElementById("world-inspector");y&&(y.innerHTML=e.renderWorldInspector(i,u));let w=document.getElementById("world-vault-mount");if(e.isRootWorld(i))w&&(w.innerHTML="");else{let G=e.renderWorldVaultPanel(i);w&&(w.innerHTML=G)}e.patchWorldTreeNav(),e.drawGraphs()}async function P(n={}){let i=e.currentWorldId(),u=e.inspectorWorldId(),y=n.vaultWorldId||(e.currentView==="world"?u:i);!y||y==="root"?e.clearVaultScopedState():await e.ensureVaultForWorld(y,{force:!!n.forceVault}),e.currentView==="world"&&n.reloadTree?await e.reloadWorldTree():(e.currentView==="world"||e.currentView==="dashboard")&&await e.loadGraphData(),e.drawGraphs()}function E(n){let i=n||"root";e.inspectorWorldId()===i&&e.vaultReadyFor(i)&&!e.state._vaultLoading||(e.state.inspectorWorldId=i,e.currentView==="world"&&(e.state._motionSkipOnce=!0,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.patchWorldPanels(),e.reloadVault(i,{force:!0}).then(()=>{e.patchWorldPanels(),FOSMotion?.flashElement?.(e.$("#world-inspector")),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())}).catch(console.error)))}function B(n,i,u,y){let w=n?.id||"root",G=`
      <button type="button" class="world-tree-item is-root${u===w?" is-inspect":""}${y===w?" is-active":""}"
        data-inspect-world="${e.esc(w)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(n?.name||"Main world")}</span>
          <span class="sub">Top-level \xB7 all ventures</span>
        </span>
      </button>`,j=i.map(U=>`
      <button type="button" class="world-tree-item kind-${e.esc(U.kind||"project")}${u===U.id?" is-inspect":""}${y===U.id?" is-active":""}"
        data-inspect-world="${e.esc(U.id)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(U.name)}</span>
          <span class="sub">${e.esc(U.kind||"project")} \xB7 ${e.esc((U.description||"No description").slice(0,42))}</span>
        </span>
      </button>`).join("");return`
      <nav class="world-tree-nav" aria-label="World hierarchy">
        ${G}
        ${i.length?`<div class="world-tree-children">${j}</div>`:""}
      </nav>`}function q(n,i){if(!n)return'<p class="body-md muted">Select a world to inspect its context.</p>';let u=n.id||"root",y=u==="root",w=y?"root":n.kind||"project",G=e.currentWorldId(),U=(e.state._worldPreviews||e.state._worldFull?.world_previews||{})[u]||"",K=i?.crm||{},W=i?.finance||{};if(e.state.worldEditing===u)return`
        <form class="world-edit-form" id="world-edit-form" data-world-id="${e.esc(u)}">
          <div class="world-inspector-title">
            <h2>Edit ${e.esc(n.name)}</h2>
            ${e.worldKindBadge(w)}
          </div>
          ${y?`
            <label>Name<input class="text-input-on-dark" name="name" value="${e.esc(n.name||"")}"></label>`:`
            <label>Name<input class="text-input-on-dark" name="name" value="${e.esc(n.name||"")}" required></label>
            <label>Category
              <select class="text-input-on-dark" name="kind" id="world-edit-kind">
                <option value="project"${n.kind==="project"?" selected":""}>Startup / venture</option>
                <option value="idea"${n.kind==="idea"?" selected":""}>Idea</option>
                <option value="research"${n.kind==="research"?" selected":""}>Technical research</option>
                <option value="technical"${n.kind==="technical"?" selected":""}>Technical project</option>
              </select>
            </label>
            <label>Knowledge template
              <select class="text-input-on-dark" name="template" id="world-edit-template">
                ${(e.state._worldTemplates||[]).map(Z=>`<option value="${e.esc(Z.id)}"${(n.template||"")===Z.id?" selected":""}>${e.esc(Z.label)}</option>`).join("")||`<option value="startup"${(n.template||"startup")==="startup"?" selected":""}>Startup / venture</option>`}
              </select>
            </label>`}
          <label>Description<textarea class="text-input-on-dark" name="description" rows="2">${e.esc(n.description||"")}</textarea></label>
          <label>Agent context<textarea class="text-input-on-dark" name="context" rows="5">${e.esc(n.context||"")}</textarea></label>
          <div class="world-inspector-actions">
            <button type="submit" class="button-primary button-sm">Save</button>
            <button type="button" class="button-tertiary-text button-sm" data-cancel-edit>Cancel</button>
          </div>
        </form>`;let N=y?[["Contacts",K.total_contacts||0],["Follow-ups",K.followups_due||0],["Open tasks",i?.tasks_open||0],["Approvals",i?.approvals_pending||0]]:[];y&&W?.set&&N.push(["Runway",W.runway_months!=null?`${W.runway_months} mo`:"\u2014"]);let x=y?e.worldTreeData().children||[]:[],Y=(i?.goals_active||[]).slice(0,5);return`
      <div class="world-inspector-title">
        <div>
          <h2>${e.esc(n.name)}</h2>
          <p class="world-meta">id: ${e.esc(u)}${n.updated_at?` \xB7 updated ${e.esc(n.updated_at)}`:""}</p>
        </div>
        ${e.worldKindBadge(w)}
      </div>
      ${G===u?'<p class="world-meta" style="color:var(--color-primary)">\u25CF Active for chat &amp; agents</p>':'<p class="world-meta">Not active \u2014 switch from the top bar or below</p>'}
      <div class="world-inspector-section">
        <h4>Description</h4>
        <p>${e.esc(n.description||"No description yet.")}</p>
      </div>
      <div class="world-inspector-section">
        <h4>Agent context</h4>
        <p>${e.esc(n.context||"No focused context \u2014 add what the agent should know in this world.")}</p>
      </div>
      ${N.length?`
        <div class="world-inspector-section">
          <h4>Global snapshot</h4>
          <div class="world-inspector-facts">${N.map(([Z,ae])=>`<div class="world-inspector-fact"><span class="k">${e.esc(Z)}</span><span class="v">${e.esc(String(ae))}</span></div>`).join("")}</div>
        </div>`:""}
      ${y&&x.length?`
        <div class="world-inspector-section">
          <h4>Sub-worlds indexed (${x.length})</h4>
          <div class="world-inspector-facts">${x.map(Z=>`<div class="world-inspector-fact"><span class="k">${e.esc(Z.name)}</span><span class="v">${e.esc(Z.kind||"project")}</span></div>`).join("")}</div>
        </div>`:""}
      ${y?"":`
        <div class="world-inspector-section">
          <h4>Template</h4>
          <p class="body-md">${e.esc(n.template||w)} \u2014 facet folders on disk under <code class="mono">data/knowledge/</code></p>
          ${n.github_repo?`<p class="world-meta">GitHub: ${e.esc(n.github_repo)}</p>`:""}
          ${n.repo_path?`<p class="world-meta">Repo: ${e.esc(n.repo_path)}</p>`:""}
        </div>`}
      ${!y&&e.worldTreeData().root?`
        <div class="world-inspector-section">
          <h4>Parent</h4>
          <p class="body-md">${e.esc(e.worldTreeData().root.name)} <span class="world-meta">(main world)</span></p>
        </div>`:""}
      ${Y.length&&y?`
        <div class="world-inspector-section">
          <h4>Active goals</h4>
          <p class="body-md">${Y.map(Z=>e.esc(typeof Z=="string"?Z:Z.title||Z)).join(" \xB7 ")}</p>
        </div>`:""}
      <div class="world-inspector-section">
        <h4>What the agent sees</h4>
        <pre class="world-context-preview">${e.esc(U||"Preview loads when graph data is fetched\u2026")}</pre>
      </div>
      <div class="world-inspector-actions">
        <button type="button" class="button-primary button-sm" data-use-world="${e.esc(u)}">Use in chat</button>
        <button type="button" class="button-outline-on-dark button-sm" data-set-active-world="${e.esc(u)}">Set active</button>
        <button type="button" class="button-tertiary-text button-sm" data-edit-world="${e.esc(u)}">Edit</button>
        ${y?"":`<button type="button" class="button-tertiary-text button-sm" data-delete-world="${e.esc(u)}">Delete</button>`}
      </div>`}function X(n,i,u){let y=e.state.ui?.vaultDocEdit,w=u||i[0]?.id||i[0]?.folder||"docs",G=i.find(W=>(W.id||W.folder)===w)||i[0]||{label:w,id:w},j=y&&y.title||"",U=y&&y.description||"",K=y?.id||"";return`
      <form class="human-form vault-doc-form" id="vault-doc-form" data-world-id="${e.esc(n.id)}" data-facet-id="${e.esc(w)}">
        ${K?`<input type="hidden" name="doc_id" value="${K}">`:""}
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Category slot</span>
            <select class="text-input-on-dark" name="facet_id" id="vault-doc-facet">
              ${i.map(W=>{let z=W.id||W.folder;return`<option value="${e.esc(z)}"${z===w?" selected":""}>${e.esc(W.label)}</option>`}).join("")}
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Title</span>
            <input class="text-input-on-dark" name="title" required placeholder="e.g. Current ICP" value="${e.esc(j)}"></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description (indexed for search)</span>
          <textarea class="text-input-on-dark" name="description" rows="3" placeholder="Short summary agents use to find this doc. Full content goes to ${e.esc(e.vaultStorageLabel())}.">${e.esc(U)}</textarea></label>
        ${K?`
        <label class="human-field"><span class="caption-uppercase">Document body (markdown)</span>
          <textarea class="text-input-on-dark" name="content" id="vault-doc-content" rows="8" placeholder="Loading\u2026"></textarea></label>`:`
        <label class="human-field"><span class="caption-uppercase">Upload file</span>
          <input type="file" name="file" accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json"></label>
        <label class="human-field"><span class="caption-uppercase">Or paste markdown</span>
          <textarea class="text-input-on-dark" name="content" rows="6" placeholder="# ICP

Target: \u2026"></textarea></label>`}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm">${K?"Update document":"Add document"}</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-cancel-doc>Cancel</button>
        </div>
        <p class="world-meta">Slot: <strong>${e.esc(G.label)}</strong> \xB7 Full files in ${e.esc(e.vaultStorageLabel())}; only title + description in vector index.</p>
      </form>`}function se(n,i){let u=e.state._githubStatus||{},y=!!u.connected,w=!!u.oauth_configured,G=i.github_repos||[],U=(e.state._githubRepos||[]).map(W=>`<option value="${e.esc(W.full_name)}">${e.esc(W.full_name)}${W.private?" (private)":""}</option>`).join(""),K=G.map(W=>{let z=e.isLinkSyncing(W.id),N=e.githubRepoDocuments(i,W.full_name),x=e.findReadmeDoc(N),Y=N.filter(ae=>e.isMarkdownFilename(ae.github_path||ae.filename)),Z=Y.length?`<div class="github-tree github-tree--repo">${e.renderGithubTreeNode(e.buildGithubPathTree(Y),n.id)}</div>`:"";return`
      <div class="github-repo-row">
        <div>
          <strong class="mono">${e.esc(W.full_name)}</strong>
          ${z?'<span class="sync-badge">Syncing</span>':""}
          <span class="world-meta">${W.file_count||N.length||0} files synced${W.synced_at?` \xB7 ${e.esc(W.synced_at)}`:""}</span>
          ${W.last_error?`<span class="world-meta" style="color:var(--color-warn)">${e.esc(W.last_error)}</span>`:""}
        </div>
        <div class="github-repo-row__actions">
          <button type="button" class="button-primary button-sm" data-vault-view-doc="${x?.id||""}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(x?.title||`${W.full_name} README`)}"${!x||z?" disabled":""}>Open README</button>
          <button type="button" class="button-outline-on-dark button-sm${z?" is-busy":""}" data-github-sync="${W.id}" data-world-id="${e.esc(n.id)}"${z?" disabled":""}>${z?"Syncing\u2026":`Sync to ${e.esc(e.vaultStorageLabel())}`}</button>
          <button type="button" class="button-tertiary-text button-sm" data-github-unlink="${W.id}" data-world-id="${e.esc(n.id)}"${z?" disabled":""}>Unlink</button>
        </div>
        ${N.length?`<details class="github-repo-files" open>
          <summary class="caption-uppercase">Repo structure \xB7 ${Y.length} markdown file${Y.length===1?"":"s"}</summary>
          ${Z||"<p class='muted body-md'>No markdown files synced yet.</p>"}
        </details>`:'<p class="body-md muted github-repo-files-empty">No files synced yet \u2014 link and sync to browse the repo tree here.</p>'}
      </div>`}).join("");return w?y?`<section class="github-repos-panel">
      <div class="github-repos-panel__head">
        <div>
          <p class="section-eyebrow">GitHub repositories</p>
          <p class="body-md muted">Connected as <strong>${e.esc(u.user?.login||"GitHub")}</strong> \u2014 link multiple repos; files sync to ${e.esc(e.vaultStorageLabel())} with searchable descriptions.</p>
        </div>
      </div>
      <div class="human-form__row" style="align-items:flex-end">
        <label class="human-field" style="flex:1">
          <span class="caption-uppercase">Add repository</span>
          <select class="text-input-on-dark" id="github-repo-pick">
            <option value="">Select a repository\u2026</option>
            ${U}
          </select>
        </label>
        <button type="button" class="button-primary button-sm" data-github-add="${e.esc(n.id)}"${e.state._syncingLinkIds.size?" disabled":""}>Link &amp; sync</button>
      </div>
      <div class="github-repo-list">${K||"<p class='body-md muted'>No GitHub repos linked yet.</p>"}</div>
    </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub repositories</p>
        <p class="body-md muted">Authorize GitHub to browse your repos and sync docs into this world's knowledge graph (${e.esc(e.vaultStorageLabel())}).</p>
        <a class="button-primary button-sm" href="/api/github/auth/start?world_id=${encodeURIComponent(n.id)}">Connect GitHub</a>
      </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub</p>
        <p class="body-md muted">Add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to <code>.env</code>, register callback <code>${e.esc(u.redirect_uri||"/api/github/callback")}</code>, then restart.</p>
      </section>`}function te(n,i){let u=n.facets||n.folders||[],y=n.storage_backend||(e.vaultStorageLabel()==="S3"?"s3":"local");return`
      <div class="vault-registry-bar" role="status" aria-live="polite">
        <span class="vault-registry-chip"><span class="k">Template</span> ${e.esc(n.template_id||i.template||"startup")}</span>
        <span class="vault-registry-chip"><span class="k">Slots</span> ${u.length}</span>
        <span class="vault-registry-chip"><span class="k">Docs</span> ${n.document_count||0}</span>
        <span class="vault-registry-chip"><span class="k">Storage</span> ${e.esc(y)}</span>
        <button type="button" class="button-tertiary-text button-sm" data-vault-reload="${e.esc(i.id)}">Reload registry</button>
      </div>`}function S(n){if(!n||n.id==="root")return"";if(e.state._vaultLoading||e.state._vaultWorldId!==n.id)return`
      <section class="driver-card vault-panel knowledge-panel panel-loading" style="margin-top:var(--space-md)">
        <p class="section-eyebrow">Knowledge vault</p>
        <h3 class="title-sm">${e.esc(n.name)}</h3>
        <div class="skeleton-grid" style="margin-top:var(--space-sm)">
          ${e.skeletonCard(3)}${e.skeletonCard(3)}${e.skeletonCard(3)}
        </div>
      </section>`;let i=e.vaultPayload()||{},u=i.facets||i.folders||[],y=i.domain_counts||{},w=e.state.ui?.vaultFacet||u[0]?.id||u[0]?.folder||null,G=e.state.ui?.vaultDocForm||e.state.ui?.vaultDocEdit,j=(u.find(N=>(N.id||N.folder)===w)||{}).documents||[],U=u.map(N=>{let x=N.id||N.folder,Y=(N.documents||[]).length+(N.files||[]).length;return`<button type="button" class="vault-facet-tab${x===w?" is-active":""}" data-vault-facet="${e.esc(x)}">${e.esc(N.label)} <span class="badge-pill">${Y}</span></button>`}).join(""),K=j.map(N=>{let x=N.github_path?` \xB7 ${N.github_path}`:"",Y=e.isMarkdownFilename(N.filename||N.github_path);return`
      <article class="vault-doc-card" data-doc-id="${N.id}">
        <div class="vault-doc-card__head">
          <h4>${e.esc(N.title)}</h4>
          <span class="world-meta">${e.esc(N.filename||"")}${e.esc(x)} \xB7 ${e.formatBytes(N.size_bytes)}${N.source_type==="github"?" \xB7 GitHub":""}</span>
        </div>
        <p class="body-md">${e.esc(N.description||"No description")}</p>
        <div class="vault-doc-card__actions">
          ${Y?`<button type="button" class="button-primary button-sm" data-vault-view-doc="${N.id}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(N.title)}">View</button>`:""}
          <button type="button" class="button-outline-on-dark button-sm" data-tag-vault-doc="${N.id}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(N.title)}" data-doc-path="${e.esc(N.github_path||N.filename||"")}">Tag in agent</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-edit-doc="${N.id}">Edit</button>
          <button type="button" class="button-tertiary-text button-sm" data-vault-delete-doc="${N.id}">Remove</button>
        </div>
      </article>`}).join(""),W=(u.find(N=>(N.id||N.folder)===w)||{}).files||[],z=W.length?`<ul class="vault-file-list">${W.map(N=>`<li class="mono">${e.esc(N.relative||N.name)} <span class="muted">on disk</span></li>`).join("")}</ul>`:"";return`
      <section class="driver-card vault-panel knowledge-panel" style="margin-top:var(--space-md)">
        <div class="vault-panel-head">
          <div>
            <p class="section-eyebrow">Knowledge graph</p>
            <h3 class="title-sm">${e.esc(n.name)} \u2014 ${e.esc(i.template_id||n.template||"startup")} template</h3>
            <p class="body-md muted">Category slots for this world type. Add docs with a searchable description; large files live in ${e.esc(e.vaultStorageLabel())}. Open the <strong>Files</strong> tab in the map above for the folder graph.</p>
            <p class="world-meta">${i.document_count||0} registered docs \xB7 ${e.esc(i.vault_path||"")}${i.repo_path?` \xB7 repo: ${e.esc(i.repo_path)}`:""}</p>
          </div>
          <div class="vault-panel-actions">
            <button type="button" class="button-primary button-sm" data-vault-add-doc="${e.esc(n.id)}">Add document</button>
            <button type="button" class="button-outline-on-dark button-sm" data-world-graph-tab="vault">Open file map</button>
            <input class="text-input-on-dark" id="vault-repo-path" placeholder="Local repo path" value="${e.esc(n.repo_path||"")}">
            <button type="button" class="button-outline-on-dark button-sm" data-vault-link="${e.esc(n.id)}">Link repo</button>
            <button type="button" class="button-outline-on-dark button-sm" data-vault-ingest="${e.esc(n.id)}">Re-ingest</button>
          </div>
        </div>
        ${e.renderGithubReposPanel(n,i)}
        ${e.renderVaultRegistryBar(i,n)}
        <div class="vault-facet-tabs" role="tablist">${U||"<span class='muted'>No categories</span>"}</div>
        ${G?e.renderVaultDocForm(n,u,w):""}
        <div class="vault-doc-grid">${K||"<p class='body-md muted'>No documents in this slot yet \u2014 add your ICP, GTM notes, research, etc.</p>"}</div>
        ${z}
        <div class="vault-search-row">
          <input class="text-input-on-dark" id="vault-search-q" placeholder="Search descriptions in this world\u2026">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-search="${e.esc(n.id)}">Search</button>
        </div>
        <pre class="vault-search-results mono" id="vault-search-results" hidden></pre>
      </section>`}function l(){let n=e.state._worldFull||{},i=n.worlds||e.state.worlds||{},u=i.root||{},y=i.children||[],w=e.inspectorWorldId(),G=e.currentWorldId(),j=e.worldById(w)||u,U=n.snapshot||e.state.snapshot||{},K=e.state.config?.my_name||"You";e.isRootWorld(j)&&e.worldGraphTab==="vault"&&(e.worldGraphTab="hierarchy");let W=!e.isRootWorld(j);return`
      <div class="worlds-page">
        <section class="worlds-hero">
          <div class="worlds-hero-lead">
            <h2>${e.esc(K)}'s world map</h2>
            <p><strong>Your venture map</strong> \u2014 create worlds, set context, link doc repos, and switch active context. You define each world; agents read what you write.</p>
          </div>
          <div class="worlds-stat">
            <span class="n">${y.length+1}</span>
            <span class="l">Worlds</span>
          </div>
          <div class="worlds-stat">
            <span class="n">${y.length}</span>
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
              ${e.renderWorldTreeNav(u,y,w,G)}
            </div>
          </section>
  
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Map</h3>
              <div class="world-graph-tabs" role="tablist">
                <button type="button" class="world-graph-tab${e.worldGraphTab==="hierarchy"?" is-active":""}" data-world-graph-tab="hierarchy">Hierarchy</button>
                <button type="button" class="world-graph-tab${e.worldGraphTab==="ecosystem"?" is-active":""}" data-world-graph-tab="ecosystem">Ecosystem</button>
                ${W?`<button type="button" class="world-graph-tab${e.worldGraphTab==="vault"?" is-active":""}" data-world-graph-tab="vault">Files</button>`:""}
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
              ${e.renderWorldInspector(j,U)}
            </div>
          </section>
        </div>
  
        ${e.isRootWorld(j)?"":`<div id="world-vault-mount">${e.renderWorldVaultPanel(j)}</div>`}
  
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
      </div>`}function m(n){return!n||n.id==="root"}async function _(n){let i=new FormData(n),u=(i.get("name")||"").toString().trim();if(u)try{let y=await e.api("/worlds",{method:"POST",body:JSON.stringify({name:u,kind:(i.get("kind")||"project").toString(),template:(i.get("template")||"").toString().trim()||void 0,description:(i.get("description")||"").toString().trim(),context:(i.get("context")||"").toString().trim(),repo_path:(i.get("repo_path")||"").toString().trim(),github_repo:(i.get("github_repo")||"").toString().trim()})});e.state.worlds=y.tree,e.setActiveWorld(y.world?.id),await e.refresh(),e.currentView==="world"&&(await e.reloadWorldTree(),e.selectInspectorWorld(y.world?.id)),n.reset(),e.state.ui&&(e.state.ui.worldCreateOpen=!1)}catch(y){alert(y.message)}}async function k(n){let i=n.dataset.worldId;if(!i)return;let u=new FormData(n),y={name:(u.get("name")||"").toString().trim(),description:(u.get("description")||"").toString(),context:(u.get("context")||"").toString()};if(i!=="root"){y.kind=(u.get("kind")||"project").toString();let w=(u.get("template")||"").toString().trim();w&&(y.template=w)}try{let w=await e.api(`/worlds/${encodeURIComponent(i)}`,{method:"PATCH",body:JSON.stringify(y)});e.state.worlds=w.tree,e.state.worldEditing=null,e.currentView==="world"?(await e.reloadWorldTree(),await e.reloadVault(i,{force:!0}),e.patchWorldPanels()):await e.refresh()}catch(w){alert(w.message)}}async function O(n){let i=n.dataset.worldId,u=(n.querySelector("[name=doc_id]")?.value||"").trim(),y=new FormData(n),w=(y.get("title")||"").toString().trim(),G=(y.get("facet_id")||n.dataset.facetId||"docs").toString(),j=(y.get("description")||"").toString().trim(),U=(y.get("content")||"").toString(),K=n.querySelector('input[type="file"]')?.files?.[0];try{if(u)await e.api(`/worlds/${encodeURIComponent(i)}/vault/documents/${encodeURIComponent(u)}`,{method:"PATCH",body:JSON.stringify({title:w,description:j,facet_id:G,content:U||void 0})});else if(K){let W=new FormData;W.append("file",K),W.append("title",w),W.append("description",j),W.append("facet_id",G),await e.apiUpload(`/worlds/${encodeURIComponent(i)}/vault/documents`,W)}else if(U.trim())await e.api(`/worlds/${encodeURIComponent(i)}/vault/documents`,{method:"POST",body:JSON.stringify({title:w,description:j,facet_id:G,content:U})});else return alert("Upload a file or paste markdown content.");e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),await e.reloadVault(i,{force:!0}),e.afterVaultMutation(i)}catch(W){alert(W.message)}}async function d(n,i){e.state.ui||(e.state.ui={});try{let u=await e.api(`/worlds/${encodeURIComponent(n)}/vault/documents/${encodeURIComponent(i)}/content`);e.state.ui.vaultDocEdit=u.document,e.state.ui.vaultDocForm=!0,e.state.ui.vaultFacet=u.document?.facet_id||e.state.ui.vaultFacet,e.currentView==="world"?e.patchWorldPanels():e.render();let y=e.$("#vault-doc-content");y&&(y.value=u.content||"")}catch(u){alert(u.message)}}async function p(n){let i=e.$("#github-repo-pick")?.value?.trim();if(!i)return alert("Select a repository");let u=document.querySelector(`[data-github-add="${n}"]`);u&&(u.disabled=!0);try{let y=await e.api(`/worlds/${encodeURIComponent(n)}/repos`,{method:"POST",body:JSON.stringify({full_name:i}),timeoutMs:12e4});if(y.job?.status==="failed")throw new Error(y.job.message||"Could not start sync");y.job?.id?await e.runGithubSyncJob(y.job.id,`Syncing ${i}`,{worldId:n,linkId:y.repo?.id}):(await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n))}catch(y){alert(y.message)}finally{u&&(u.disabled=e.state._syncingLinkIds.size>0)}}async function $(n,i){if(!e.isLinkSyncing(i))try{let u=await e.api(`/worlds/${encodeURIComponent(n)}/repos/${encodeURIComponent(i)}/sync`,{method:"POST",body:"{}",timeoutMs:12e4});if(u.job?.status==="failed")throw new Error(u.job.message||"Could not start sync");if(u.job?.id){let y=(e.state._worldVault?.github_repos||[]).find(w=>String(w.id)===String(i))?.full_name||"repository";await e.runGithubSyncJob(u.job.id,`Re-syncing ${y}`,{worldId:n,linkId:i})}}catch(u){alert(u.message)}}async function D(n,i){if(confirm("Unlink this repo and remove its synced documents from this world?"))try{await e.api(`/worlds/${encodeURIComponent(n)}/repos/${encodeURIComponent(i)}`,{method:"DELETE"}),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(u){alert(u.message)}}async function T(n,i){if(confirm("Remove this document from the knowledge graph?"))try{await e.api(`/worlds/${encodeURIComponent(n)}/vault/documents/${encodeURIComponent(i)}`,{method:"DELETE"}),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(u){alert(u.message)}}async function V(n){try{let i=await e.api(`/worlds/${encodeURIComponent(n)}/vault/ingest`,{method:"POST",body:"{}"});alert(`Ingested ${i.files||0} files (${i.total_chunks||0} chunks)`),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(i){alert(i.message)}}async function M(n){let i=e.$("#vault-repo-path")?.value?.trim();if(!i)return alert("Enter a local repo path");try{let u=await e.api(`/worlds/${encodeURIComponent(n)}/vault/link-repo`,{method:"POST",body:JSON.stringify({repo_path:i})});if(u.error)return alert(u.error);alert(`Linked and ingested ${u.files||0} files`),await e.reloadVault(n,{force:!0}),await e.refresh(),e.afterVaultMutation(n)}catch(u){alert(u.message)}}async function Q(n){let i=e.$("#vault-search-q")?.value?.trim();if(!i)return;let u=e.$("#vault-search-results");try{let w=((await e.api(`/vault/search?${new URLSearchParams({q:i,world_id:n})}`)).hits||[]).map(G=>`[${G.metadata?.domain||"?"}] ${G.metadata?.source||""}
${(G.text||"").slice(0,200)}`).join(`

---

`)||"No hits.";u&&(u.textContent=w,u.hidden=!1)}catch(y){u&&(u.textContent=y.message,u.hidden=!1)}}async function F(n){if(confirm("Delete this sub-world?"))try{let i=await e.api(`/worlds/${encodeURIComponent(n)}`,{method:"DELETE"});e.state.worlds=i.tree,e.currentWorldId()===n&&e.setActiveWorld("root"),e.inspectorWorldId()===n&&e.selectInspectorWorld("root"),await e.refresh(),e.currentView==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.render())}catch(i){alert(i.message)}}e.renderWorldOptionsForDocs=L,e.githubRepoDocuments=I,e.findReadmeDoc=v,e.countGithubTreeFiles=t,e.renderGithubTreeNode=f,e.tagVaultDocInChat=h,e.buildVaultGraph=g,e.vaultGraphForWorld=o,e.worldGraphLegendHtml=a,e.renderWorldCreateForm=s,e.worldById=c,e.inspectorWorldId=r,e.loadWorldVault=b,e.reloadVault=R,e.reloadWorldTree=C,e.ensureVaultForWorld=A,e.patchWorldTreeNav=J,e.patchWorldPanels=ee,e.onWorldContextChanged=P,e.selectInspectorWorld=E,e.renderWorldTreeNav=B,e.renderWorldInspector=q,e.renderVaultDocForm=X,e.renderGithubReposPanel=se,e.renderVaultRegistryBar=te,e.renderWorldVaultPanel=S,e.renderWorld=l,e.isRootWorld=m,e.createWorldFromForm=_,e.saveWorldEdit=k,e.submitVaultDoc=O,e.startVaultDocEdit=d,e.connectGithubRepo=p,e.syncGithubRepo=$,e.unlinkGithubRepo=D,e.deleteVaultDoc=T,e.vaultIngest=V,e.vaultLinkRepo=M,e.vaultSearch=Q,e.deleteWorld=F}function _e(e){function L(){return e.state.ui?.crmTab||localStorage.getItem("fos_crm_tab")||"contacts"}function I(d){let p=e.state.worlds||e.state._worldFull?.worlds||{},$=p.root,D=p.children||[],T=[];return $&&T.push(`<option value="${e.esc($.id||"root")}"${(d||"root")===($.id||"root")?" selected":""}>${e.esc($.name||"Main world")}</option>`),D.forEach(V=>{T.push(`<option value="${e.esc(V.id)}"${d===V.id?" selected":""}>${e.esc(V.name||V.id)}</option>`)}),T.join("")}function v(d={}){let p=e.crmTab();return`<nav class="crm-tabs" role="tablist" aria-label="CRM sections">${[["contacts","Contacts",d.contacts],["companies","Companies",d.companies],["pipeline","Pipeline",null],["outreach","Outreach",null]].map(([D,T,V])=>`<button type="button" role="tab" aria-selected="${p===D}" class="crm-tab${p===D?" crm-tab--active":""}" data-crm-tab="${D}">${e.esc(T)}${V!=null?`<span class="crm-tab__count">${V}</span>`:""}</button>`).join("")}</nav>`}function t(){let d=e.state._crm?.contacts||[],p=e.state._crm?.followups_due||[],$=!!e.state.ui?.crmFormOpen,D=e.state._crmCompanies?.companies||[],T=F=>e.CRM_STATUSES.map(n=>`<option value="${n}"${n===F?" selected":""}>${e.esc(n)}</option>`).join(""),V='<option value="">\u2014 None \u2014</option>'+D.map(F=>`<option value="${F.id}">${e.esc(F.name)}</option>`).join(""),M=d.slice(0,50).map(F=>`<tr>
      <td>${e.esc(F.name)}</td><td>${e.esc(F.company||"\u2014")}</td><td>${e.esc(F.role||"\u2014")}</td>
      <td><select class="text-input-on-dark crm-status-select" data-crm-status="${F.id}" aria-label="Status for ${e.esc(F.name)}">${T(F.status||"prospect")}</select></td>
      <td class="muted">${e.esc(F.email||"")}</td>
      <td class="muted">${e.esc(F.phone||"")}</td>
      <td><label class="human-field--checkbox" style="margin:0">
        <input type="checkbox" data-crm-whatsapp="${F.id}" ${F.whatsapp_enabled?"checked":""} ${F.phone?"":"disabled"} aria-label="Allow WhatsApp for ${e.esc(F.name)}">
      </label></td>
      <td>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${F.id}" data-followup-days="3">3d</button>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${F.id}" data-followup-days="7">7d</button>
        ${F.whatsapp_enabled?`<button type="button" class="button-tertiary-text button-sm" data-crm-wa-thread="${F.id}">WA</button>`:""}
      </td></tr>`).join(""),Q=p.map(F=>`<li class="crm-followup-row">
      <span>${e.esc(F.name)} @ ${e.esc(F.company||"?")}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goto="crm">Open</button>
    </li>`).join("")||"<li class='muted'>None due</li>";return`
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Contacts</p>
            <h3 class="title-sm">People &amp; follow-ups</h3>
          </div>
          <button type="button" class="button-primary button-sm" data-toggle-ui="crmFormOpen">${$?"Hide form":"Add contact"}</button>
        </div>
        ${$?`
        <form class="human-form" id="crm-create-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Full name"></label>
            <label class="human-field"><span class="caption-uppercase">Company</span>
              <select class="text-input-on-dark" name="company_id">${V}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Role</span>
              <input class="text-input-on-dark" name="role" placeholder="Title"></label>
            <label class="human-field"><span class="caption-uppercase">Email</span>
              <input class="text-input-on-dark" name="email" type="email" placeholder="email@company.com"></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${T("prospect")}</select></label>
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
      <section class="driver-card span-12"><p class="caption-uppercase">Follow-ups due</p><ul class="list-plain" style="margin-top:var(--space-sm)">${Q}</ul></section>
      <section class="band-light span-12">
        <p class="caption-uppercase" style="color:var(--color-muted)">Contacts (${d.length})</p>
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Role</th><th>Status</th><th>Email</th><th>Phone</th><th>WA</th><th>Follow up</th></tr></thead>
        <tbody>${M||'<tr><td colspan="8" class="muted">No contacts yet \u2014 use Add contact above.</td></tr>'}</tbody></table></div>
        ${e.state._crmWaThread?.length?`<div class="driver-card" style="margin-top:var(--space-md)">
          <p class="caption-uppercase">WhatsApp thread</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${e.state._crmWaThread.map(F=>`<li><span class="muted">${e.esc((F.sent_at||"").slice(0,16).replace("T"," "))}</span> <strong>${e.esc(F.direction||"")}</strong>: ${e.esc((F.body||"").slice(0,200))}</li>`).join("")}</ul>
        </div>`:""}
      </section>`}function f(){if(e.state._crmCompaniesLoading)return`<section class="driver-card span-12 crm-loading-panel" aria-busy="true">
        <div class="crm-skeleton crm-skeleton--title"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
      </section>`;if(e.state._crmCompaniesError)return`<section class="driver-card span-12 crm-error-panel">
        <p class="body-md">Could not load companies \u2014 ${e.esc(e.state._crmCompaniesError)}</p>
        <button type="button" class="button-primary button-sm" data-crm-reload>Retry</button>
      </section>`;let d=e.state._crmCompanies?.companies||[],p=e.state._crmCompanies?.meta?.unlinked_contact_companies||0,$=!!e.state.ui?.crmCompanyFormOpen,D=e.state.ui?.crmCompanyDetail,T=e.currentWorldId(),V=i=>e.COMPANY_STATUSES.map(u=>`<option value="${u}"${u===i?" selected":""}>${e.esc(u)}</option>`).join(""),M=d.map(i=>`<tr>
      <td><button type="button" class="button-tertiary-text" data-crm-company-detail="${i.id}">${e.esc(i.name)}</button></td>
      <td>${e.esc(i.sector||i.industry||"\u2014")}</td>
      <td><span class="crm-status-pill crm-status-pill--${e.esc((i.status||"prospect").replace(/\s+/g,"-"))}">${e.esc(i.status||"prospect")}</span></td>
      <td>${i.contact_count??0}</td>
      <td class="muted">${e.esc((i.last_contacted_at||"").slice(0,10))}</td>
    </tr>`).join(""),Q="";if(D){let i=d.find(y=>String(y.id)===String(D))||e.state._crmCompanyDetail?.company,u=e.state._crmCompanyDetail?.contacts||[];i&&(Q=`<aside class="crm-company-drawer driver-card">
          <div class="human-panel__head">
            <h4 class="title-sm">${e.esc(i.name)}</h4>
            <button type="button" class="button-outline-on-dark button-sm" data-crm-company-close>Close</button>
          </div>
          <dl class="settings-kv">
            <div class="settings-kv__row"><dt>Sector</dt><dd>${e.esc(i.sector||i.industry||"\u2014")}</dd></div>
            <div class="settings-kv__row"><dt>Status</dt><dd>${e.esc(i.status||"prospect")}</dd></div>
            <div class="settings-kv__row"><dt>Website</dt><dd>${i.website?`<a href="${e.esc(i.website)}" target="_blank" rel="noopener">${e.esc(i.website)}</a>`:"\u2014"}</dd></div>
          </dl>
          ${i.research_summary?`<p class="body-md" style="margin-top:var(--space-sm)">${e.esc(i.research_summary)}</p>`:""}
          ${i.notes?`<p class="muted body-sm">${e.esc(i.notes)}</p>`:""}
          <p class="caption-uppercase" style="margin-top:var(--space-md)">Linked contacts (${u.length})</p>
          <ul class="list-plain">${u.map(y=>`<li>${e.esc(y.name)} \u2014 ${e.esc(y.role||"")} ${y.email?`<span class="muted">${e.esc(y.email)}</span>`:""}</li>`).join("")||"<li class='muted'>None</li>"}</ul>
        </aside>`)}let F=p>0?`
      <div class="crm-import-banner">
        <div>
          <p class="body-md"><strong>${p}</strong> unique company name${p===1?"":"s"} on contacts not yet linked to company records.</p>
          <p class="body-sm muted">Import creates company rows and links your existing contacts automatically.</p>
        </div>
        <button type="button" class="button-primary button-sm" data-crm-import-companies>Import from contacts</button>
      </div>`:"",n=M?"":`
      <div class="crm-empty-state">
        <p class="body-md">No company records yet.</p>
        <p class="body-sm muted">${p>0?"Import from contacts above, or add a company manually.":"Add companies manually, or enter company names when adding contacts."}</p>
      </div>`;return`
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <h3 class="title-sm">Companies</h3>
            <p class="body-sm muted">${d.length} account${d.length===1?"":"s"}</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-outline-on-dark button-sm" data-crm-reload>Refresh</button>
            <button type="button" class="button-primary button-sm" data-toggle-ui="crmCompanyFormOpen">${$?"Hide form":"Add company"}</button>
          </div>
        </div>
        ${F}
        ${$?`
        <form class="human-form" id="crm-company-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Company name"></label>
            <label class="human-field"><span class="caption-uppercase">World</span>
              <select class="text-input-on-dark" name="world_id" required>${e.renderWorldOptionsForCrm(T)}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Sector</span>
              <input class="text-input-on-dark" name="sector" placeholder="e.g. Manufacturing"></label>
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${V("prospect")}</select></label>
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
        ${n||`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Sector</th><th>Status</th><th>Contacts</th><th>Last contact</th></tr></thead>
        <tbody>${M}</tbody></table></div>`}
        ${Q}
      </section>`}function h(){let d=e.state._crm?.pipeline||{},p=Object.entries(d).map(([V,M])=>`<div class="kv"><span class="k">${e.esc(V)}</span><span class="v">${M}</span></div>`).join("")||"<p class='muted'>No pipeline data</p>",$=e.state._crmCompanies?.companies||[],D={};$.forEach(V=>{let M=V.status||"prospect";D[M]=(D[M]||0)+1});let T=Object.entries(D).map(([V,M])=>`<div class="kv"><span class="k">${e.esc(V)}</span><span class="v">${M} companies</span></div>`).join("")||"<p class='muted'>No company pipeline data</p>";return`<section class="driver-card span-6"><p class="caption-uppercase">Contact pipeline</p><div style="margin-top:var(--space-sm)">${p}</div></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Company pipeline</p><div style="margin-top:var(--space-sm)">${T}</div></section>`}function g(){return e.state.ui?.crmOutreachWorld||e.currentWorldId()}function o(){let d=e.state._crmCampaignReview,p=d?.campaign;return p?.status==="done"||d?.done&&!d?.pending_count?"complete":d?.campaign&&["review"].includes(p.status)&&d.pending_count>0?"review":d?.campaign&&["review"].includes(p.status)&&!d.pending_count?"complete":e.state._crmOutreachJob?.active||["researching","drafting","created"].includes(p?.status||e.state._crmOutreachJob?.status)||e.state.ui?.crmCampaignId&&p&&!["review","done","failed"].includes(p.status)?"running":"setup"}function a(d){let p=[["setup","1. Setup"],["running","2. Research & draft"],["review","3. Review & send"],["complete","4. Done"]],D={setup:0,running:1,review:2,complete:3}[d]??0;return`<nav class="crm-outreach-steps" aria-label="Outreach progress">${p.map(([T,V],M)=>`<span class="${M<D?"crm-outreach-step crm-outreach-step--done":M===D?"crm-outreach-step crm-outreach-step--active":"crm-outreach-step"}">${e.esc(V)}</span>`).join("")}</nav>`}function s(){let d=e.state._crmOutreachJob||{},p=e.state._crmCampaignDetail?.campaign||e.state._crmCampaignReview?.campaign||{},$=d.phase||p.status||"Starting\u2026",T=(e.state._crmCampaignReview?.companies||e.state._crmCampaignDetail?.review?.companies||[]).length||p.batch_size||"?";return`<section class="driver-card span-12 crm-outreach-running">
      <p class="section-eyebrow">Outreach in progress</p>
      <h3 class="title-sm">${e.esc(p.name||"Campaign")}</h3>
      ${e.renderCrmOutreachSteps("running")}
      <div class="crm-outreach-progress-strip">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:40%"></div></div>
        <p class="body-md"><strong>${e.esc($)}</strong></p>
        <p class="muted body-sm">Researching companies via knowledge tree + web, then drafting messages. This runs in the background \u2014 you can leave this page.</p>
        <p class="muted body-sm">Batch: ${T} companies \xB7 World: <span data-active-world-label>${e.esc(e.activeWorldLabel())}</span></p>
      </div>
      <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-refresh>Refresh status</button>
    </section>`}function c(d){let p=d.progress||{},$=p.by_status||{};return`<section class="driver-card span-12">
      <p class="section-eyebrow">Campaign complete</p>
      <h3 class="title-sm">${e.esc(d.campaign?.name||"Campaign")}</h3>
      ${e.renderCrmOutreachSteps("complete")}
      <div class="crm-outreach-summary">
        <div class="kv"><span class="k">Sent</span><span class="v">${$.sent||0}</span></div>
        <div class="kv"><span class="k">Skipped</span><span class="v">${$.skipped||0}</span></div>
        <div class="kv"><span class="k">Failed</span><span class="v">${$.failed||0}</span></div>
        <div class="kv"><span class="k">Companies</span><span class="v">${p.companies_complete||0}/${p.companies_total||0}</span></div>
      </div>
      <div class="human-form__actions" style="margin-top:var(--space-md)">
        <button type="button" class="button-primary button-sm" data-crm-outreach-back>Start new campaign</button>
      </div>
    </section>`}function r(d){let p=d.campaign,$=d.strategy||{},D=d.current_company,T=d.current_research||{},V=d.current_drafts||[],M=d.progress||{},Q=V.filter(w=>w.channel==="email"),F=V.filter(w=>w.channel==="whatsapp"),n=D?.company_name||D?.name||"Company",i=M.company_index||1,u=M.companies_total||1,y=w=>{let G=e.draftApproveDisabledReason(w),j=(w.body||"").length;return`<div class="crm-draft-card driver-card" data-draft-id="${w.id}">
        <div class="crm-draft-card__head">
          <p class="caption-uppercase">${w.channel==="email"?"Gmail":"WhatsApp"} \u2192 ${e.esc(w.contact_name||"Contact")}</p>
          ${w.channel==="email"?`<span class="muted body-sm">${e.esc(w.email||"")}</span>`:`<span class="muted body-sm">${e.esc(w.phone||"")}</span>`}
        </div>
        ${w.personalization_notes?`<p class="body-sm muted">${e.esc(w.personalization_notes)}</p>`:""}
        ${w.channel==="email"?`<label class="human-field"><span class="caption-uppercase">Subject</span>
          <input class="text-input-on-dark crm-draft-subject" data-draft-id="${w.id}" value="${e.esc(w.subject||"")}"></label>`:""}
        <label class="human-field"><span class="caption-uppercase">Message</span>
          <textarea class="text-input-on-dark crm-draft-body" data-draft-id="${w.id}" data-channel="${e.esc(w.channel)}" rows="${w.channel==="whatsapp"?3:6}">${e.esc(w.body||"")}</textarea>
          ${w.channel==="whatsapp"?`<span class="caption muted crm-wa-count" data-draft-id="${w.id}">${j}/300</span>`:""}
        </label>
        <div class="human-form__actions">
          <button type="button" class="button-primary button-sm" data-crm-draft-approve="${w.id}" ${G?'disabled title="'+e.esc(G)+'"':""}>Approve &amp; Send</button>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-draft-skip="${w.id}">Skip message</button>
        </div>
        ${w.error_message?`<p class="crm-draft-error">${e.esc(w.error_message)}</p>`:""}
        ${G?`<p class="muted body-sm">${e.esc(G)}</p>`:""}
      </div>`};return`<section class="driver-card span-12">
      <div class="human-panel__head">
        <div>
          <p class="section-eyebrow">Review &amp; send</p>
          <h3 class="title-sm">${e.esc(p.name||"Campaign")}</h3>
          <p class="muted body-sm">Company ${i} of ${u} \xB7 ${d.pending_count||0} message(s) left \u2014 approve one at a time</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-back>Exit review</button>
      </div>
      ${e.renderCrmOutreachSteps("review")}
      <div class="crm-outreach-progress-meta">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:${Math.round((M.companies_complete||0)/Math.max(u,1)*100)}%"></div></div>
        <div class="crm-outreach-stats">
          <span class="badge-pill">Sent ${(M.by_status||{}).sent||0}</span>
          <span class="badge-pill">Skipped ${(M.by_status||{}).skipped||0}</span>
          <span class="badge-pill">Pending ${d.pending_count||0}</span>
        </div>
      </div>
      <details class="crm-strategy-details">
        <summary class="caption-uppercase">Cohort strategy</summary>
        <pre class="body-sm muted" style="white-space:pre-wrap">${e.esc(JSON.stringify($,null,2))}</pre>
      </details>
      ${D?`<div class="crm-company-review driver-card">
        <div class="human-panel__head">
          <h4 class="title-sm">${e.esc(n)}</h4>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-skip-company="${D.company_id}">Skip company</button>
        </div>
        <p class="body-sm muted">${e.esc(T.sector||D.sector||"")}</p>
        ${T.crm_research_summary?`<p class="body-sm">${e.esc(String(T.crm_research_summary).slice(0,400))}</p>`:""}
        ${(T.web_hits||[]).length?`<p class="caption-uppercase">Web signals</p><ul class="list-plain">${T.web_hits.slice(0,3).map(w=>`<li class="body-sm">${e.esc(w.snippet||w.title||"")}${w.url?` <a href="${e.esc(w.url)}" target="_blank" rel="noopener">link</a>`:""}</li>`).join("")}</ul>`:""}
        ${(T.vault_files_used||[]).length?`<p class="caption-uppercase">Vault files used</p><ul class="list-plain">${T.vault_files_used.map(w=>`<li class="body-sm">${e.esc(w.title||"doc #"+w.doc_id)}</li>`).join("")}</ul>`:""}
      </div>`:""}
      ${Q.length?'<p class="caption-uppercase">Email drafts</p>':""}
      ${Q.map(y).join("")}
      ${F.length?'<p class="caption-uppercase" style="margin-top:var(--space-md)">WhatsApp drafts</p>':""}
      ${F.map(y).join("")}
      ${!V.length&&D?'<p class="muted">No drafts for this company \u2014 contacts may lack email or WhatsApp allowlist.</p>':""}
    </section>`}function b(){let d=e.state._crmCampaigns?.campaigns||[],p=e.crmOutreachWorldId(),$=(e.state._crmCompanies?.companies||[]).filter(u=>p&&p!=="root"&&u.world_id&&u.world_id!==p?!1:u.status==="prospect"||!u.status),D=e.state.ui?.crmOutreachBatch||5,T=new Set(e.state.ui?.crmOutreachSelected||[]),M=((e.state.worlds||e.state._worldFull?.worlds||{}).children||[]).length>0,Q=$.map(u=>{let y=T.has(u.id),w=u.contact_count||0;return`<label class="crm-company-check human-field--checkbox">
        <input type="checkbox" data-crm-company-toggle="${u.id}" ${y?"checked":""} ${T.size>=D&&!y?"disabled":""}>
        <span>${e.esc(u.name)} <span class="muted">${e.esc(u.sector||"")} \xB7 ${w} contact(s)</span></span>
      </label>`}).join(""),F=[5,10,15,20].map(u=>`<option value="${u}"${D===u?" selected":""}>${u}</option>`).join(""),n=d.slice(0,12).map(u=>`<tr>
        <td><button type="button" class="${u.status==="review"?"button-primary":"button-tertiary-text"} button-sm" data-crm-campaign="${u.id}">${e.esc(u.name)}</button></td>
        <td><span class="badge-pill">${e.esc(u.status)}</span></td>
        <td class="muted">${e.esc((u.created_at||"").slice(0,10))}</td>
        <td>${u.status==="review"?`<button type="button" class="button-outline-on-dark button-sm" data-crm-campaign="${u.id}">Continue review</button>`:""}</td>
      </tr>`).join("")||'<tr><td colspan="4" class="muted">No campaigns yet</td></tr>',i=$.length?`<p class="caption-uppercase">Companies (${T.size}/${D} selected)</p>
         <div class="crm-company-checklist">${Q}</div>`:`<div class="crm-outreach-empty">
          <p class="body-md">No prospect companies available for this world.</p>
          <p class="body-sm muted">Go to Companies and import from your existing contacts, or add companies manually.</p>
          <div class="human-form__actions">
            <button type="button" class="button-primary button-sm" data-crm-tab="companies">Open companies</button>
          </div>
        </div>`;return`<section class="driver-card span-12 human-panel">
      <div class="human-panel__head">
        <div>
          <h3 class="title-sm">Batch outreach</h3>
          <p class="body-sm muted">Research, strategy, and personalized drafts \u2014 you approve every send.</p>
        </div>
      </div>
      ${e.renderCrmOutreachSteps("setup")}
      ${M?"":'<p class="crm-outreach-warn">Create a sub-world under <strong>World</strong> first \u2014 outreach requires a venture context for vault research.</p>'}
      <form class="human-form" id="crm-outreach-form" style="margin-top:var(--space-md)">
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">World (required)</span>
            <select class="text-input-on-dark" name="world_id" id="crm-outreach-world">${e.renderWorldOptionsForCrm(p)}</select></label>
          <label class="human-field"><span class="caption-uppercase">Batch size</span>
            <select class="text-input-on-dark" name="batch_size" id="crm-outreach-batch">${F}</select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Outreach brief</span>
          <textarea class="text-input-on-dark" name="brief" rows="3" placeholder="e.g. Indian manufacturing SMBs \u2014 energy cost savings, 15-min discovery call, direct tone"></textarea></label>
        ${i}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm" ${T.size&&p!=="root"?"":"disabled"}>
            Start outreach (${T.size||0} companies)
          </button>
        </div>
      </form>
      <section style="margin-top:var(--space-lg)">
        <p class="caption-uppercase">Recent campaigns</p>
        <div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${n}</tbody></table></div>
      </section>
    </section>`}function R(){let d=e.crmOutreachStep(),p=e.state._crmCampaignReview;return d==="running"?e.renderCrmOutreachRunningPanel():d==="complete"&&p?.campaign?e.renderCrmOutreachCompletePanel(p):d==="review"&&p?.campaign?e.renderCrmOutreachReviewPanel(p):e.renderCrmOutreachSetupPanel()}function C(){let d=e.crmTab(),p={contacts:e.state._crm?.contacts?.length||0,companies:e.state._crmCompanies?.companies?.length||0},$="";return d==="contacts"?$=e.renderCrmContactsPanel():d==="companies"?$=e.renderCrmCompaniesPanel():d==="pipeline"?$=e.renderCrmPipelinePanel():$=e.renderCrmOutreachPanel(),`<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <h2 class="title-md" style="text-wrap:balance">CRM</h2>
            <p class="body-sm muted">Contacts, companies, pipeline, and batch outreach in one place.</p>
          </div>
        </div>
        ${e.renderCrmTabs(p)}
      </section>
      ${$}
    </div>`}async function A(){let d=e.crmTab();e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld||(e.state.ui.crmOutreachWorld=e.currentWorldId());let p=d==="outreach"?e.crmOutreachWorldId():e.currentWorldId(),$=d==="companies"?"?include_unassigned=1":p&&p!=="root"?`?world_id=${encodeURIComponent(p)}&include_unassigned=1`:"?include_unassigned=1",D=p&&p!=="root"?`?world_id=${encodeURIComponent(p)}`:"";e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[T,V,M]=await Promise.all([e.api("/crm/contacts"),e.api(`/crm/companies${$}`),d==="outreach"?e.api(`/crm/outreach/campaigns${D}`).catch(()=>({campaigns:[]})):Promise.resolve(e.state._crmCampaigns||{campaigns:[]})]);if(e.state._crm=T,e.state._crmCompanies=V,d==="outreach"&&(e.state._crmCampaigns=M,e.state.ui?.crmCampaignId)){let Q=e.state.ui.crmCampaignId,[F,n]=await Promise.all([e.api(`/crm/outreach/campaigns/${Q}`).catch(()=>null),e.api(`/crm/outreach/campaigns/${Q}/review`).catch(()=>null)]);e.state._crmCampaignDetail=F,e.state._crmCampaignReview=n?.campaign?n:F?.review;let i=e.state._crmCampaignReview?.campaign||F?.campaign;i&&["researching","drafting","created"].includes(i.status)?(e.state._crmOutreachJob={active:!0,phase:i.status,status:i.status},e.state._crmOutreachPollId||e.pollCrmOutreachJob(Q)):i?.status==="review"&&(e.state._crmOutreachJob={phase:"Ready for review",active:!1})}}catch(T){e.state._crmCompaniesError=T.message||"Could not load CRM data"}finally{e.state._crmCompaniesLoading=!1}}async function J(d){let p=new FormData(d),$=(p.get("name")||"").toString().trim();if(!$)return;let D=(p.get("company_id")||"").toString().trim();try{await e.api("/crm/contacts",{method:"POST",body:JSON.stringify({name:$,company_id:D?parseInt(D,10):null,role:(p.get("role")||"").toString().trim(),email:(p.get("email")||"").toString().trim(),status:(p.get("status")||"prospect").toString(),linkedin_url:(p.get("linkedin_url")||"").toString().trim(),phone:(p.get("phone")||"").toString().trim(),whatsapp_enabled:p.get("whatsapp_enabled")==="1",notes:(p.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmFormOpen=!1),await e.refresh(),e.render(),d.reset()}catch(T){alert(T.message)}}async function ee(){let d=e.currentWorldId(),p=d&&d!=="root"?d:null;try{let $=await e.api("/crm/companies/import-from-contacts",{method:"POST",body:JSON.stringify({world_id:p})});await e.loadCrmData(),e.render();let D=`Imported ${$.created||0} companies and linked ${$.linked_contacts||0} contacts.`;e.state._toast?e.state._toast(D):alert(D)}catch($){alert($.message)}}async function P(d){let p=new FormData(d),$=(p.get("name")||"").toString().trim(),D=(p.get("world_id")||"").toString().trim();if(!(!$||!D))try{await e.api("/crm/companies",{method:"POST",body:JSON.stringify({name:$,world_id:D,sector:(p.get("sector")||"").toString().trim(),status:(p.get("status")||"prospect").toString(),website:(p.get("website")||"").toString().trim(),linkedin_url:(p.get("linkedin_url")||"").toString().trim(),notes:(p.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmCompanyFormOpen=!1),e.render(),d.reset()}catch(T){alert(T.message)}}async function E(d){if(d)try{let p=await e.api(`/crm/companies/${encodeURIComponent(d)}`);e.state._crmCompanyDetail=p,e.state.ui||(e.state.ui={}),e.state.ui.crmCompanyDetail=d,e.render()}catch(p){alert(p.message)}}async function B(d){let p=new FormData(d),$=(p.get("world_id")||"").toString().trim(),D=parseInt(p.get("batch_size")||"5",10)||5,T=(p.get("brief")||"").toString().trim(),V=e.state.ui?.crmOutreachSelected||[];if(!$||$==="root")return alert("Select a sub-world for outreach (not Main world).");if(!V.length)return alert("Select at least one company.");if(!T)return alert("Add a brief so the agent knows what kind of message to write.");try{let M=await e.api("/crm/outreach/campaigns",{method:"POST",body:JSON.stringify({world_id:$,batch_size:D,brief:T,company_ids:V})}),Q=await e.api(`/crm/outreach/campaigns/${M.campaign_id}/start`,{method:"POST"});e.state._crmOutreachJob={...Q.job||{},active:!0,phase:"Starting\u2026"},e.state.ui||(e.state.ui={}),e.state.ui.crmCampaignId=M.campaign_id,e.state.ui.crmOutreachSelected=[],e.state.ui.crmTab="outreach",e.render(),e.pollCrmOutreachJob(M.campaign_id)}catch(M){alert(M.message)}}async function q(d,p=!1){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId);let $=async()=>{try{let D=await e.api(`/crm/outreach/campaigns/${d}`),T=D.campaign||{},V=D.review||{},M=D.job||{};if(e.state._crmCampaignDetail=D,T.status==="review"||T.status==="done"||T.status==="failed"){e.state._crmOutreachJob={active:!1,phase:T.status==="review"?"Ready for review":T.status},e.state._crmCampaignReview=V.campaign?V:await e.api(`/crm/outreach/campaigns/${d}/review`),e.state._crmOutreachPollId=null,e.render();return}e.state._crmOutreachJob={active:!0,phase:M.phase||T.status||"running\u2026",status:T.status},e.render(),p||(e.state._crmOutreachPollId=setTimeout($,2500))}catch{p||(e.state._crmOutreachPollId=setTimeout($,4e3))}};p?await $():e.state._crmOutreachPollId=setTimeout($,500)}async function X(d){if(d){e.state.ui||(e.state.ui={}),e.state.ui.crmTab="outreach",e.state.ui.crmCampaignId=d,localStorage.setItem("fos_crm_tab","outreach");try{e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${d}/review`),e.render()}catch(p){alert(p.message)}}}async function se(d){let p=e.state.ui?.crmCampaignId;if(!(!p||!d)&&confirm("Skip all pending messages for this company?"))try{await e.api(`/crm/outreach/campaigns/${p}/companies/${d}/skip`,{method:"POST"}),e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${p}/review`),e.render()}catch($){alert($.message)}}async function te(d){let p=document.querySelector(`.crm-draft-subject[data-draft-id="${d}"]`),$=document.querySelector(`.crm-draft-body[data-draft-id="${d}"]`),D={};p&&(D.subject=p.value),$&&(D.body=$.value),Object.keys(D).length&&await e.api(`/crm/outreach/drafts/${d}`,{method:"PATCH",body:JSON.stringify(D)})}async function S(d){if(d)try{await e.saveCrmDraftEdits(d);let p=await e.api(`/crm/outreach/drafts/${d}/approve-send`,{method:"POST"});if(p.error)return alert(p.error);let $=e.state.ui?.crmCampaignId;$&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${$}/review`)),await e.loadCrmData(),e.render()}catch(p){alert(p.message)}}async function l(d){if(d)try{await e.api(`/crm/outreach/drafts/${d}/skip`,{method:"POST"});let p=e.state.ui?.crmCampaignId;p&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${p}/review`)),e.render()}catch(p){alert(p.message)}}async function m(d,p){if(!(!d||!p))try{await e.api(`/crm/contacts/${encodeURIComponent(d)}`,{method:"PATCH",body:JSON.stringify({status:p})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch($){alert($.message)}}async function _(d,p){if(d)try{await e.api(`/crm/contacts/${encodeURIComponent(d)}`,{method:"PATCH",body:JSON.stringify({whatsapp_enabled:!!p})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch($){alert($.message)}}async function k(d){if(d)try{let p=await e.api(`/whatsapp/messages?contact_id=${encodeURIComponent(d)}`);e.state._crmWaThread=p.messages||[],e.render()}catch(p){alert(p.message)}}async function O(d,p){let $=parseInt(p,10)||7;await e.api(`/crm/contacts/${d}/followup`,{method:"POST",body:JSON.stringify({days:$}),timeoutMs:15e3}),e.state._crm=await e.api("/crm/contacts"),e.currentView==="crm"&&e.render()}e.crmTab=L,e.renderWorldOptionsForCrm=I,e.renderCrmTabs=v,e.renderCrmContactsPanel=t,e.renderCrmCompaniesPanel=f,e.renderCrmPipelinePanel=h,e.crmOutreachWorldId=g,e.crmOutreachStep=o,e.renderCrmOutreachSteps=a,e.renderCrmOutreachRunningPanel=s,e.renderCrmOutreachCompletePanel=c,e.renderCrmOutreachReviewPanel=r,e.renderCrmOutreachSetupPanel=b,e.renderCrmOutreachPanel=R,e.renderCrm=C,e.loadCrmData=A,e.submitCrmContact=J,e.importCrmCompaniesFromContacts=ee,e.submitCrmCompany=P,e.openCrmCompanyDetail=E,e.submitCrmOutreach=B,e.pollCrmOutreachJob=q,e.openCrmCampaignReview=X,e.skipCrmCompany=se,e.saveCrmDraftEdits=te,e.approveCrmDraft=S,e.skipCrmDraft=l,e.updateCrmStatus=m,e.updateCrmWhatsapp=_,e.loadCrmWaThread=k,e.scheduleCrmFollowup=O}function $e(e){function L(){let h=e.state._goals||{},g=!!e.state.ui?.goalsFormOpen,o=!!e.state.ui?.reminderFormOpen,a=(h.active||[]).map(b=>`<li class="goal-row">
      <span><strong>${e.esc(b.title)}</strong>${b.detail?" \u2014 "+e.esc(b.detail):""}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goal-done="${b.id}">Done</button>
    </li>`).join("")||"<li class='muted'>No active goals \u2014 add one below.</li>",s=(e.state.tasks||[]).map(b=>`<li>${e.esc(b.title)} <span class="muted">P${b.priority||3}</span></li>`).join("")||"<li class='muted'>No open tasks</li>",c=(h.reminders||[]).map(b=>`<li class="reminder-row">
      <span>${e.esc(b.text)} <span class="muted">${e.esc((b.due_at||"").slice(0,16).replace("T"," "))}</span></span>
      <span class="reminder-row__actions">
        <button type="button" class="button-outline-on-dark button-sm" data-reminder-done="${b.id}">Done</button>
        <button type="button" class="button-tertiary-text button-sm" data-reminder-cancel="${b.id}">Cancel</button>
      </span>
    </li>`).join("")||"<li class='muted'>No reminders</li>",r=(h.plans||[]).map(b=>`<li>${e.esc(b.goal)}</li>`).join("")||"<li class='muted'>No open plans</li>";return`<div class="dashboard-grid">
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Goals</p>
            <h3 class="title-sm">Outcomes you own</h3>
            <p class="body-md muted">Track goals and reminders directly \u2014 no agent required.</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-primary button-sm" data-toggle-ui="goalsFormOpen">${g?"Hide goal form":"New goal"}</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="reminderFormOpen">${o?"Hide reminder":"Reminder"}</button>
          </div>
        </div>
        ${g?`
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
        ${o?`
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
      <section class="driver-card span-6"><p class="caption-uppercase">Open tasks</p><ul class="list-plain" style="margin-top:var(--space-sm)">${s}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Reminders</p><ul class="list-plain" style="margin-top:var(--space-sm)">${c}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Plans &amp; projects</p><ul class="list-plain" style="margin-top:var(--space-sm)">${r}</ul></section>
    </div>`}async function I(h){let g=new FormData(h),o=(g.get("title")||"").toString().trim();if(o)try{await e.api("/goals",{method:"POST",body:JSON.stringify({title:o,detail:(g.get("detail")||"").toString().trim(),priority:parseInt(g.get("priority")||"3",10)||3})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.goalsFormOpen=!1),await e.refresh(),e.render(),h.reset()}catch(a){alert(a.message)}}async function v(h){if(h)try{await e.api(`/goals/${encodeURIComponent(h)}`,{method:"PATCH",body:JSON.stringify({status:"done"})}),e.state._goals=await e.api("/goals"),await e.refresh(),e.render()}catch(g){alert(g.message)}}async function t(h){let g=new FormData(h),o=(g.get("text")||"").toString().trim(),a=(g.get("due_at")||"").toString().trim();if(!o||!a)return;let s=a.length===16?`${a}:00`:a;try{await e.api("/reminders",{method:"POST",body:JSON.stringify({text:o,due_at:s})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.reminderFormOpen=!1),e.render(),h.reset()}catch(c){alert(c.message)}}async function f(h,g){if(await e.api(`/reminders/${h}`,{method:"PATCH",body:JSON.stringify({status:g}),timeoutMs:15e3}),e.state._goals=await e.api("/goals"),e.currentView==="goals"&&e.render(),e.currentView==="dashboard"){let o=e.currentWorldId(),a=o&&o!=="root"?`?world_id=${encodeURIComponent(o)}`:"";e.state._nudges=(await e.api(`/nudges${a}`).catch(()=>({nudges:[]}))).nudges||[],e.render()}}e.renderGoals=L,e.submitGoal=I,e.markGoalDone=v,e.submitReminder=t,e.updateReminderStatus=f}function Se(e){function L(){let v=e.state._memoryResults||[],t=e.state._memoryFull||{},f=t.collections||[],h=t.knowledge_graph||{},g=v.map(a=>`<div class="memory-hit">
      <span class="badge-pill">${e.esc(a.collection)}</span>
      <p class="body-md" style="margin-top:var(--space-xxs);max-width:72ch">${e.esc(a.text)}</p></div>`).join(""),o=f.map(a=>`
      <div class="memory-collection">
        <h4>${e.esc(a.name)} <span class="muted">(${a.count} vectors)</span></h4>
        ${(a.samples||[]).map(s=>`<p class="memory-sample">${e.esc(s.text)}</p>`).join("")||"<p class='muted'>Empty collection</p>"}
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
        <p class="body-md" style="margin-bottom:var(--space-sm)">Knowledge graph (${(h.entities||[]).length} entities, ${(h.relations||[]).length} relations) plus recent vector memory chunks.</p>
        <div id="graph-memory" class="graph-canvas"></div>
        <div class="graph-detail" id="graph-memory-detail">Click a node to inspect</div>
      </div>
      <div id="memory-tab-collections" ${e.memoryGraphTab!=="collections"?"hidden":""}>${o||"<p class='body-md'>No vector memory yet.</p>"}</div>
      <div id="memory-tab-search" ${e.memoryGraphTab!=="search"?"hidden":""}>
        <div id="memory-results">${g||'<p class="body-md">Search to find relevant memories.</p>'}</div>
      </div>`}async function I(){let v=e.$("#memory-q")?.value?.trim();if(e.state._memoryQ=v,!v)return;let t=await e.api("/memory/search?q="+encodeURIComponent(v));e.state._memoryResults=t.results,e.render()}e.renderMemory=L,e.searchMemory=I}function ke(e){function L(t){let f=t.content||"";return t.role==="agent"||t.role==="assistant"?`<div class="msg-md history-msg__body">${window.FOSMarkdown?.render?.(f)||e.esc(f)}</div>`:`<p class="body-md history-msg__body">${e.esc(f)}</p>`}function I(){let f=(e.state._history||{}).sessions||[],h=e.state._artifacts||[],g=e.state._historySession,o=e.historyTab,a=f.length?f.map(r=>`
      <button type="button" class="history-session${g?.id===r.id?" is-active":""}" data-history-session="${e.esc(r.id)}">
        <span class="history-session__title">${e.esc(r.title||"Conversation")}</span>
        <span class="history-session__meta muted">${e.esc(r.specialist||"supervisor")} \xB7 ${r.message_count||0} msgs \xB7 ${e.fmtHistoryTime(r.updated_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No conversations yet. Ask the agent something to start a session.</p>",s="<p class='body-md muted'>Select a conversation to view messages, runs, and linked documents.</p>";if(g?.messages?.length){let r=g.messages.map(C=>`
        <div class="history-msg history-msg--${e.esc(C.role)}">
          <span class="caption-uppercase">${e.esc(C.role)}</span>
          ${e.renderHistoryMessageContent(C)}
          <span class="muted" style="font-size:11px">${e.fmtHistoryTime(C.created_at)}</span>
        </div>`).join(""),b=(g.runs||[]).map(C=>`
        <article class="history-run">
          <div class="history-run__head">
            <span class="mono">${e.esc(C.specialist||C.actor||"agent")}</span>
            <span class="muted">${C.duration_s||0}s</span>
          </div>
          ${e.renderLiveFlow((C.tools||[]).map(A=>({name:A.name,decision:A.decision,t:A.t})),"No tools")}
          ${C.assistant_reply?`<div class="history-run__reply msg-md">${window.FOSMarkdown?.render?.(C.assistant_reply)||e.esc(C.assistant_reply)}</div>`:""}
        </article>`).join("")||"",R=(g.artifacts||[]).map(C=>`
        <button type="button" class="history-doc-btn" data-open-document="${C.id}">
          <span class="badge-pill">${e.esc(C.kind)}</span>
          <span>${e.esc(C.title)}</span>
        </button>`).join("")||"<p class='muted'>No documents in this session.</p>";s=`
        <div class="history-detail__actions">
          <button type="button" class="button-primary button-sm" data-open-chat-session="${e.esc(g.id)}">Open in chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New conversation</button>
        </div>
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Messages</p>
        <div class="history-messages">${r}</div>
        ${b?`<p class="caption-uppercase" style="margin-top:var(--space-md)">Runs</p>${b}`:""}
        <p class="caption-uppercase" style="margin-top:var(--space-md)">Documents</p>
        <div class="history-artifacts">${R}</div>`}let c=h.length?h.map(r=>`
      <article class="history-doc-card" tabindex="0" data-open-document="${r.id}">
        <div class="history-doc-card__head">
          <span class="badge-pill">${e.esc(r.kind)}</span>
          <span class="muted">${e.fmtHistoryTime(r.created_at)}</span>
        </div>
        <h3 class="title-sm">${e.esc(r.title||"Untitled")}</h3>
        ${r.run_id?`<p class="world-meta">Run ${e.esc(r.run_id)}</p>`:""}
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
        <button type="button" class="graph-tab ${o==="conversations"?"is-active":""}" data-history-tab="conversations">Conversations</button>
        <button type="button" class="graph-tab ${o==="documents"?"is-active":""}" data-history-tab="documents">Documents</button>
      </div>
      ${o==="conversations"?`<div class="history-layout">
        <section class="driver-card history-sessions">${a}</section>
        <section class="driver-card history-detail">${s}</section>
      </div>`:`<section class="driver-card history-documents-grid">${c}</section>`}`}async function v(t){e.state._historySelectedId=t;try{e.state._historySession=await e.api(`/history/sessions/${t}`)}catch{e.state._historySession=null}e.render()}e.renderHistoryMessageContent=L,e.renderHistory=I,e.loadHistorySession=v}function Ce(e){function L(){let v=e.state.approvals||[];return v.length?`<section class="driver-card">${v.map(t=>`
      <div class="approval-block">
        <div class="approval-meta caption-uppercase"><span class="mono">#${t.id}</span> \xB7 ${e.esc(t.tool_name)}</div>
        <div class="approval-summary body-md">${e.esc(t.summary)}</div>
        <div class="approval-actions">
          <button type="button" class="button-primary button-sm" data-approve="${t.id}">Approve</button>
          <button type="button" class="button-outline-on-dark button-sm" data-reject="${t.id}">Reject</button>
        </div>
      </div>`).join("")}</section>`:'<section class="driver-card empty-state"><p class="title-sm">No pending approvals</p></section>'}async function I(v,t){try{let f=await e.api(`/approvals/${v}/${t?"approve":"reject"}`,{method:"POST"});e.chatHistory.push({role:"system",text:f.result}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.refresh(),e.currentView==="approvals"&&e.render()}catch(f){alert(f.message)}}e.renderApprovals=L,e.decideApproval=I}function Ie(e){function L(){let I=e.state._tools||{},v=(I.tools||[]).map(t=>`<div class="tool-row">
      <div class="name">${e.esc(t.name)}${t.requires_approval?' <span class="badge-pill">approval</span>':""}</div>
      <div class="cat">${e.esc(t.category)}</div>
      <div class="desc">${e.esc(t.description)}</div></div>`).join("");return`<p class="body-md" style="margin-bottom:var(--space-xs);max-width:60ch">${I.total||0} tools \xB7 ${Object.keys(I.by_category||{}).length} categories. Tool-RAG retrieves the most relevant set per message.</p>
    <div class="tool-list">${v}</div>`}e.renderTools=L}function Ae(e){function L(){let I=e.state._activity?.traces_full||[],v=e.state._activity?.actions||e.state.actions||[],t=I.length?I.map(h=>`
      <article class="trace-card">
        <div class="trace-card-head">
          <span class="mono">${e.esc(h.actor)}</span>
          <span class="muted">${h.duration_s}s</span>
        </div>
        <p class="message">${e.esc(h.message)}</p>
        ${e.renderLiveFlow(h.events,"No tools in this turn")}
        ${h.final?`<p class="world-meta" style="margin-top:var(--space-xs)">\u2192 ${e.esc(h.final)}</p>`:""}
      </article>`).join(""):"<p class='body-md muted'>No agent turns logged today. Send a message in Chat to see the decision flow here.</p>",f=v.slice(0,20).map(h=>`<div class="activity-row">
      <div class="mono">${e.esc(h.tool_name)}</div>
      <div class="meta">${e.esc(h.actor)} \xB7 ${e.esc((h.created_at||"").slice(0,16))}</div></div>`).join("")||"<p class='muted'>No actions logged.</p>";return`<div class="dashboard-grid">
      <section class="driver-card span-8"><p class="caption-uppercase">Decision flow</p><div style="margin-top:var(--space-sm)">${t}</div></section>
      <section class="driver-card span-4"><p class="caption-uppercase">Tool log</p><div style="margin-top:var(--space-sm)">${f}</div></section>
    </div>`}e.renderActivity=L}function Le(e){function L(){let o=e.state._infraHealth;if(!o)return`<section class="driver-card span-12">
        <div class="infra-health-head">
          <p class="caption-uppercase">Infrastructure</p>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Check health</button>
        </div>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Monitor EC2 host, S3 vault bucket, and disk on this server.</p>
      </section>`;let a=o.host||{},s=o.s3||{},c=o.disk||{},r=o.app||{},b=a.platform==="ec2"?e.infraKvRow("Instance",a.instance_id,!0)+e.infraKvRow("Region",a.region)+e.infraKvRow("Type",a.instance_type)+e.infraKvRow("IAM role",a.iam_role):e.infraKvRow("Host","Local / dev"),R=s.configured?e.infraKvRow("Bucket",s.bucket,!0)+e.infraKvRow("Region",s.region)+e.infraKvRow("Read/write",s.read_write_ok?"OK":s.reachable?"Reachable only":"Failed"):e.infraKvRow("Storage","Local disk only"),C=e.infraKvRow("Data path",c.path,!0)+e.infraKvRow("Free",c.free_gb!=null?`${c.free_gb} GB`:null)+e.infraKvRow("Used",c.used_pct!=null?`${c.used_pct}%`:null),A=!!o.ok;return`<section class="driver-card span-12">
      <div class="infra-health-head">
        <div>
          <p class="caption-uppercase">Infrastructure</p>
          <p class="world-meta">Last checked ${e.esc(e.fmtTime(o.checked_at)||o.checked_at||"\u2014")} \xB7 App storage: <strong>${e.esc(r.storage_backend||"\u2014")}</strong></p>
        </div>
        <div class="infra-health-head__actions">
          <span class="badge-pill${A?" badge-pill--ok":" badge-pill--warn"}">${A?"All checks passed":"Needs attention"}</span>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Refresh</button>
        </div>
      </div>
      <div class="infra-health-grid">
        ${e.infraHealthCard("EC2 host",a.ok!==!1,b,a.detail)}
        ${e.infraHealthCard("S3 vault",s.configured?!!s.ok:!0,R,s.detail)}
        ${e.infraHealthCard("Disk",!!c.ok,C,c.detail)}
      </div>
    </section>`}function I(){let o=e.state.config||{},a=o.integrations||{},s=e.state._whatsapp||{},c=(o.autonomy_level||"balanced").toLowerCase(),r=o.whatsapp_enabled?s.connected?`Connected${s.linked_phone?` (${e.esc(s.linked_phone)})`:""}`:s.qr_pending?"Scan QR below":"Bridge not connected":"Disabled in .env",b=s.qr_data_url?`<img src="${s.qr_data_url}" alt="WhatsApp QR code" width="280" height="280" style="margin-top:var(--space-sm);border-radius:8px">`:"",R=o.agent_paused?'<button type="button" class="button-primary" id="toggle-pause">Resume agent</button>':'<button type="button" class="button-outline-on-dark" id="toggle-pause">Pause agent</button>';return`<div class="dashboard-grid settings-page">
      ${e.renderInfrastructureHealth()}
      <section class="driver-card span-4 settings-panel">
        <p class="caption-uppercase">Identity</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Name</dt><dd>${e.esc(o.my_name)}</dd></div>
          <div class="settings-kv__row"><dt>Company</dt><dd>${e.esc(o.company_name)}</dd></div>
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
                <option value="cautious"${c==="cautious"?" selected":""}>Cautious \u2014 ask before most actions</option>
                <option value="balanced"${c==="balanced"?" selected":""}>Balanced \u2014 routine tools auto-run</option>
                <option value="autonomous"${c==="autonomous"?" selected":""}>Autonomous \u2014 minimal prompts</option>
              </select></label>
            <label class="human-field human-field--checkbox">
              <input type="checkbox" name="auto_approve" value="1"${o.auto_approve?" checked":""}>
              <span>Auto-approve low-risk tool calls</span>
            </label>
          </div>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save policy</button>
            ${R}
          </div>
        </form>
      </section>
      <section class="driver-card span-4 settings-panel">
        <p class="caption-uppercase">Channels</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Web UI</dt><dd>${o.web_ui_enabled?"On":"Off"}</dd></div>
          <div class="settings-kv__row"><dt>Telegram</dt><dd>${o.telegram_enabled?"On":"Off"}</dd></div>
          <div class="settings-kv__row"><dt>Port</dt><dd>${o.dashboard_port}</dd></div>
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
          ${e.integrationCard("WhatsApp",a.whatsapp&&s.connected,"Allowlisted CRM contacts only; every send needs approval")}
        </div>
      </section>
      ${o.whatsapp_enabled?`<section class="driver-card span-12 human-panel" id="whatsapp-settings-panel">
        <p class="section-eyebrow">WhatsApp</p>
        <h3 class="title-sm">Linked device</h3>
        <p class="body-md muted">Personal WhatsApp via Baileys (unofficial). Only contacts you allow in CRM are stored or messaged. Outbound always requires your approval.</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Status</dt><dd>${r}</dd></div>
          <div class="settings-kv__row"><dt>Allowlisted</dt><dd>${s.allowlist_count??s.allowlist_size??"\u2014"} contacts</dd></div>
        </dl>
        ${b}
        <p class="caption muted" style="margin-top:var(--space-xs)">Open WhatsApp \u2192 Linked devices \u2192 Link a device. QR refreshes every few seconds while pending.</p>
      </section>`:""}
    </div>`}function v(){e.whatsappPollTimer&&(clearInterval(e.whatsappPollTimer),e.whatsappPollTimer=null)}async function t(){if(e.currentView!=="settings"){e.stopWhatsappPoll();return}try{let o=await e.api("/whatsapp/status");if(e.state._whatsapp={...e.state._whatsapp||{},...o},o.qr_pending){let a=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=a.qr_data_url||null}else e.state._whatsapp.qr_data_url=null;e.currentView==="settings"&&e.render({graphs:!1})}catch{}}function f(){e.stopWhatsappPoll();let o=e.state.config||{};e.currentView!=="settings"||!o.whatsapp_enabled||(e.pollWhatsappSettings(),e.whatsappPollTimer=setInterval(t,5e3))}async function h(){let o=document.getElementById("btn-infra-refresh");o&&(o.disabled=!0);try{e.state._infraHealth=await e.api("/infrastructure/health"),e.render(),e.afterRender()}catch(a){console.error("Infrastructure health check failed:",a)}finally{o&&(o.disabled=!1)}}async function g(o){let a=new FormData(o);try{let s=await e.api("/agent/config",{method:"POST",body:JSON.stringify({autonomy_level:(a.get("autonomy_level")||"balanced").toString(),auto_approve:a.get("auto_approve")==="1"})});e.state.config={...e.state.config||{},...s},e.updateStatus(),e.render()}catch(s){alert(s.message)}}e.renderInfrastructureHealth=L,e.renderSettings=I,e.stopWhatsappPoll=v,e.pollWhatsappSettings=t,e.startWhatsappPollIfNeeded=f,e.refreshInfraHealth=h,e.saveAgentConfig=g}function Re(e){function L(P){let E={name:"",dirs:{},files:[]};for(let B of P){let q=B.github_path||B.filename||B.title||"file",X=q.split("/").filter(Boolean),se=X.pop()||q,te=E;for(let S of X)te.dirs[S]||(te.dirs[S]={name:S,dirs:{},files:[]}),te=te.dirs[S];te.files.push({...B,_fileName:se})}return E}function I(){return document.hidden?e.LIVE_POLL_HIDDEN_MS:e.LIVE_POLL_MS}function v(){e.livePollTimer&&clearTimeout(e.livePollTimer),e.livePollTimer=setTimeout(async()=>{await e.pollLive(),e.scheduleLivePoll()},e.livePollDelayMs())}function t(P){return e.WORLD_KINDS[P]||e.WORLD_KINDS.project}function f(P){let E=e.worldKindMeta(P||"project");return`<span class="world-kind-badge ${E.cls}">${e.esc(E.label)}</span>`}function h(){return e.state._worldFull?.worlds||e.state.worlds||{}}function g(P){e.currentView==="world"&&e.inspectorWorldId()===P?e.patchWorldPanels():e.currentView==="agents"&&e.currentWorldId()===P?e.patchAgentsVaultPanel():e.render({graphs:!1})}function o(){return(e.state._worldVault?.storage_backend||e.state._worldVault?.vault?.storage_backend)==="s3"?"S3":"local object storage"}function a(P){let E=Number(P)||0;return E<1024?`${E} B`:E<1048576?`${(E/1024).toFixed(1)} KB`:`${(E/1048576).toFixed(1)} MB`}function s(P){if(P.channel==="email"){if(!(P.subject||"").trim())return"Subject required";if(!(P.body||"").trim())return"Body required";if(!(P.email||"").trim())return"Contact has no email"}if(P.channel==="whatsapp"){if(!(P.body||"").trim())return"Message required";if((P.body||"").length>300)return"Max 300 characters";if(!P.whatsapp_enabled)return"WhatsApp not allowlisted";if(!(P.phone||"").trim())return"No phone on contact"}return""}function c(P){if(!P)return"";let E=typeof P=="number"?new Date(P*1e3):new Date(P);return Number.isNaN(E.getTime())?String(P).slice(0,16):E.toLocaleString()}function r(P,E,B=!1){let q=E==null||E===""?"\u2014":String(E);return`<div class="infra-kv"><dt>${e.esc(P)}</dt><dd${B?' class="infra-kv__val"':""}>${e.esc(q)}</dd></div>`}function b(P,E,B,q){let X=E?"Healthy":"Issue";return`<div class="integration-card infra-health-card${E?" is-connected":" is-warning"}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(P)}</span>
        <span class="integration-card__status">${X}</span>
      </div>
      <dl class="infra-kv-list">${B}</dl>
      ${q?`<p class="integration-card__detail">${e.esc(q)}</p>`:""}
    </div>`}function R(P,E,B){return`<div class="integration-card${E?" is-connected":""}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(P)}</span>
        <span class="integration-card__status">${E?"Active":"Not configured"}</span>
      </div>
      <p class="integration-card__detail">${e.esc(B)}</p>
    </div>`}function C(P){let E=parseInt(P.dataset.crmCompanyToggle,10);if(!E)return;e.state.ui||(e.state.ui={});let B=e.state.ui.crmOutreachBatch||5,q=new Set(e.state.ui.crmOutreachSelected||[]);if(P.checked){if(q.size>=B){P.checked=!1;return}q.add(E)}else q.delete(E);e.state.ui.crmOutreachSelected=[...q],e.render()}function A(){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null,e.state.ui&&(e.state.ui.crmCampaignId=null,e.state.ui.crmOutreachSelected=[]),e.state._crmCampaignReview=null,e.state._crmCampaignDetail=null,e.state._crmOutreachJob=null,e.loadCrmData().then(()=>e.render())}async function J(P){let E=P.target.files?.[0];if(!E)return;let B=new FormData;B.append("file",E),e.chatHistory.push({role:"user",text:`\u{1F4CE} Uploaded: ${E.name}`}),e.render();try{B.append("world_id",e.currentWorldId());let q=await fetch("/api/upload",{method:"POST",body:B,credentials:"same-origin"}),X=await q.json().catch(()=>({}));if(q.status===401&&X.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!q.ok)throw new Error(X.error||q.statusText);e.chatHistory.push({role:"agent",text:X.reply})}catch(q){e.chatHistory.push({role:"system",text:"Upload failed: "+q.message})}localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),P.target.value="",e.render()}function ee(){let P=document.querySelector(".app"),E=e.$("#btn-sidebar-collapse"),B="fos_sidebar_collapsed";localStorage.getItem(B)==="1"&&P?.classList.add("sidebar-collapsed");let q=()=>{let X=P?.classList.contains("sidebar-collapsed");E?.setAttribute("aria-label",X?"Expand sidebar":"Collapse sidebar"),E?.setAttribute("title",X?"Expand sidebar":"Collapse sidebar")};q(),E?.addEventListener("click",()=>{P?.classList.toggle("sidebar-collapsed"),localStorage.setItem(B,P?.classList.contains("sidebar-collapsed")?"1":"0"),q()})}e.buildGithubPathTree=L,e.livePollDelayMs=I,e.scheduleLivePoll=v,e.worldKindMeta=t,e.worldKindBadge=f,e.worldTreeData=h,e.afterVaultMutation=g,e.vaultStorageLabel=o,e.formatBytes=a,e.draftApproveDisabledReason=s,e.fmtHistoryTime=c,e.infraKvRow=r,e.infraHealthCard=b,e.integrationCard=R,e.toggleCrmOutreachCompany=C,e.closeCrmCampaignReview=A,e.uploadFile=J,e.initSidebarCollapse=ee}function Oe(e){async function L(f){if(f==="crm"&&await e.loadCrmData(),f==="settings"&&(e.state._whatsapp=await e.api("/whatsapp/status").catch(()=>({})),e.state._whatsapp.qr_pending)){let h=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=h.qr_data_url||null}if(f==="goals"&&(e.state._goals=await e.api("/goals")),f==="tools"&&(e.state._tools=await e.api("/tools")),f==="agents"){let[h,g,o,a,s]=await Promise.all([e.api("/agents"),e.api("/activity").catch(()=>({})),e.api("/agents/runs").catch(()=>({runs:[],actions:[]})),e.api("/crm/contacts").catch(()=>({})),e.api("/tools").catch(()=>({}))]);e.state._agents=h,e.state._agents?.specialists?.length||(e.state._agents={...e.state._agents,specialists:e.DEFAULT_SPECIALISTS}),e.state._activity=g,e.state._agentRunsApi=o.runs||[],e.state._agentActions=o.actions||g.actions||[],e.state._crm=a,e.state._tools=s;let c=e.currentWorldId();c&&c!=="root"?await e.ensureVaultForWorld(c):e.clearVaultScopedState()}if(f==="settings"&&(e.state._infraHealth=await e.api("/infrastructure/health").catch(()=>e.state._infraHealth||null)),f==="activity"&&(e.state._activity=await e.api("/activity")),f==="history"){let h=e.currentWorldId(),g=h&&h!=="root"?`?world_id=${encodeURIComponent(h)}`:"";e.state._history=await e.api(`/history${g}`).catch(()=>({sessions:[],recent_runs:[]})),e.state._artifacts=(await e.api(`/artifacts${g}`).catch(()=>({artifacts:[]}))).artifacts||[],e.state._historySelectedId?e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null):e.state._history.sessions?.[0]&&(e.state._historySelectedId=e.state._history.sessions[0].id,e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null))}if(f==="documents")if(e.state._artifacts=(await e.api("/artifacts?limit=100").catch(()=>({artifacts:[]}))).artifacts||[],e.state._documentsSelectedId)try{let h=await e.api(`/artifacts/${e.state._documentsSelectedId}/content`,{timeoutMs:15e3});e.state._documentDraft=h.content||""}catch{e.state._documentDraft=""}else e.state._documentDraft="";if(f==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldGraph=e.state._worldFull?.graph??null,e.state._worldHierarchyGraph=e.state._worldFull?.hierarchy_graph??null,e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.invalidateGraphCache("graph-world"),e.state._worldTemplates?.length||(e.state._worldTemplates=(await e.api("/world-templates").catch(()=>({}))).templates||[]),e.state.inspectorWorldId||(e.state.inspectorWorldId=e.currentWorldId()),e.state._githubStatus=await e.api("/github/status").catch(()=>({})),e.state._githubStatus?.connected?e.state._githubRepos=(await e.api("/github/repos").catch(()=>({}))).repos||[]:e.state._githubRepos=[],await e.ensureVaultForWorld(e.inspectorWorldId()),await e.resumeActiveSyncJobs(e.inspectorWorldId())),f==="memory"&&(e.state._memoryFull=await e.api("/graph/memory"),e.state._memoryGraph=e.state._memoryFull?.graph??null,e.invalidateGraphCache("graph-memory")),(f==="dashboard"||f==="chat"||f==="agents")&&(e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})))),f==="chat"){e.state._activity=await e.api("/activity").catch(()=>e.state._activity||{}),e.state._agentRunsApi=(await e.api("/agents/runs").catch(()=>({}))).runs||e.state._agentRunsApi,await e.loadChatSessionsList(),await e.loadChatFromServer();let h=e.currentWorldId();h&&h!=="root"&&await e.ensureVaultForWorld(h)}if(f==="dashboard"){e.state._world=await e.api("/world").catch(()=>e.state._world||{}),e.state._worldGraph=e.state._world?.graph??e.state._worldGraph??null,e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})));let h=e.currentWorldId(),g=h&&h!=="root"?`?world_id=${encodeURIComponent(h)}`:"";e.state._nudges=(await e.api(`/nudges${g}`).catch(()=>({nudges:[]}))).nudges||[]}["dashboard","agents","chat","world","memory"].includes(f)&&await e.loadGraphData()}async function I(f=!1){let h=e.state.activeWorldId,g=e.state.selectedSpecialist,o=e.state.ui;if(f||!e.state.config?.my_name)e.state={...e.state,...await e.api("/state")};else{let a=await e.api("/summary");e.state.usage=a.usage??e.state.usage,e.state.unread_notifications=a.unread_notifications??e.state.unread_notifications,a.worlds&&(e.state.worlds=a.worlds),a.config&&(e.state.config=a.config),e.state.snapshot={...e.state.snapshot||{},approvals_pending:a.approvals_pending??e.state.snapshot?.approvals_pending??0,reminders_pending:a.reminders_pending??e.state.snapshot?.reminders_pending??0,tasks_open:a.tasks_open??e.state.snapshot?.tasks_open??0,crm:{...e.state.snapshot?.crm||{},followups_due:a.crm_followups_due??e.state.snapshot?.crm?.followups_due??0}}}e.state.activeWorldId=h||e.state.activeWorldId||"root",e.state.selectedSpecialist=g??e.state.selectedSpecialist??"",e.state.ui=o||e.state.ui;try{e.populateWorldSelect(),e.populateSpecialistSelect()}catch(a){console.error("populate selects failed:",a)}e.updateBadges(),e.updateStatus(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function v(){}function t(){e.refreshTimer&&clearTimeout(e.refreshTimer),!document.hidden&&(e.refreshTimer=setTimeout(async()=>{try{await e.refresh(!1),e.updateBadges(),e.updateStatus()}catch(f){console.error(f),e.setConnectionStatus("Reconnecting\u2026","paused")}e.scheduleBackgroundRefresh()},e.REFRESH_MS))}e.loadViewData=L,e.refresh=I,e.loadBootExtras=v,e.scheduleBackgroundRefresh=t}function De(e){function L(){return window.FOS_MOBILE_PRIMARY_VIEWS||new Set(["dashboard","chat","agents","world"])}function I(){document.getElementById("sidebar")?.classList.remove("is-open"),document.body.classList.remove("mobile-nav-open");let r=document.getElementById("sidebar-backdrop");r&&(r.classList.remove("is-visible"),r.setAttribute("hidden","")),document.getElementById("mobile-menu-drawer")?.close?.()}function v(){let r=document.getElementById("sidebar"),b=document.getElementById("sidebar-backdrop");!r||!b||(r.classList.add("is-open"),document.body.classList.add("mobile-nav-open"),b.removeAttribute("hidden"),requestAnimationFrame(()=>b.classList.add("is-visible")))}function t(r){let b=e.mobilePrimaryViews();document.querySelectorAll(".mobile-tab").forEach(R=>{let C=R.dataset.mobileView;C==="more"?R.classList.toggle("is-active",!b.has(r)):R.classList.toggle("is-active",C===r)}),document.querySelectorAll(".mobile-menu-link").forEach(R=>{R.classList.toggle("is-active",R.dataset.view===r)})}function f(r){e.currentView=r,e.$$(".nav button").forEach(R=>R.classList.toggle("is-active",R.dataset.view===r)),e.$("#view-title").textContent=e.TITLES[r]||r,e.syncMobileNav(r),e.closeMobileShell(),FOSMotion?.animateTopbarTitle?.(),["dashboard","agents","chat","activity","world"].includes(r)?e.startLivePoll():e.stopLivePoll();let b=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1}),e.loadViewData(r).then(()=>{b===e.viewDataLoadGen&&(e.setViewLoading(!1),e.render())}).catch(R=>{console.error(R),b===e.viewDataLoadGen&&e.setViewLoading(!1)})}function h(r={}){try{e.currentView==="dashboard"&&e.drawDashboardCharts()}catch(A){console.warn("dashboard charts skipped:",A)}try{r.graphs!==!1&&e.drawGraphs()}catch(A){console.warn("graphs skipped:",A)}e.state._motionSkipOnce?e.state._motionSkipOnce=!1:FOSMotion?.runView?.(e.currentView),FOSMotion?.ensureContentVisible?.();let b=document.getElementById("content"),R=window.FOSMarkdown?.enhance?.(b),C=()=>{(e.currentView==="chat"||e.currentView==="agents")&&e.initMsgReadMore(b)};if(R?.then?R.then(C).catch(C):C(),e.currentView==="documents"&&!e.documentsEditMode){let A=e.$("#docs-preview");A&&window.FOSMarkdown?.renderInto?.(A,e.state._documentDraft??"")}e.startWhatsappPollIfNeeded()}function g(){let r=(e.state.approvals||[]).length,b=e.$("#nav-approval-badge");b&&(b.textContent=r,b.hidden=!r);let R=e.$("#mobile-approval-badge");R&&(R.textContent=r,R.hidden=!r);let C=e.$("#mobile-menu-approval-badge");C&&(C.textContent=r,C.hidden=!r);let A=e.state.unread_notifications||0,J=e.$("#notif-badge");J&&(J.textContent=A,J.hidden=!A)}function o(r,b="ok"){let R=e.$("#status-dot"),C=e.$("#status-text"),A=e.$("#mobile-status-dot"),J=e.$("#mobile-status-text");C&&(C.textContent=r),J&&(J.textContent=r),R?.classList.toggle("ok",b==="ok"),R?.classList.toggle("paused",b!=="ok"),A?.classList.toggle("ok",b==="ok"),A?.classList.toggle("paused",b!=="ok")}function a(){let r=e.state.config||{};r.agent_paused?e.setConnectionStatus("Agent paused","paused"):e.setConnectionStatus("Online","ok");let b=e.$("#brand-sub");b&&(b.textContent=r.my_name||r.company_name||e.APP_NAME),document.title=r.my_name?`${e.APP_NAME} \u2014 ${r.my_name}`:e.APP_NAME}async function s(r,b){b&&(await e.api(`/notifications/${encodeURIComponent(b)}/read`,{method:"POST"}).catch(()=>{}),await e.refresh(),e.updateBadges()),r==="approvals"?e.goView("approvals"):r==="crm"?e.goView("crm"):r==="goals"?e.goView("goals"):r==="chat"?e.goView("chat"):e.goView(r||"dashboard"),e.$("#notif-drawer")?.close()}function c(){let r=e.state.notifications||[];e.$("#notif-list").innerHTML=r.length?r.map(b=>{let R=b.meta?.action||(b.kind==="approval"?"approvals":b.kind==="agent"?"chat":""),C=R?`<button type="button" class="button-outline-on-dark button-sm" data-notif-action="${e.esc(R)}" data-notif-id="${e.esc(b.id)}" style="margin-top:8px">Open</button>`:"",A=b.meta?.url,J=!C&&A?`<a class="button-outline-on-dark button-sm" href="${e.esc(A)}" target="_blank" rel="noopener" style="margin-top:8px;display:inline-block">Open</a>`:"";return`
      <div class="notif-item ${b.read?"":"unread"}" data-notif-id="${e.esc(b.id)}">
        <div class="title">${e.esc(b.title)}</div>
        <div class="body">${e.esc(b.body)}</div>
        <div class="muted" style="font-size:11px;margin-top:4px">${e.fmtTime(b.ts)}</div>
        ${C||J}
      </div>`}).join(""):"<p class='muted'>No notifications yet.</p>"}e.mobilePrimaryViews=L,e.closeMobileShell=I,e.openSidebar=v,e.syncMobileNav=t,e.goView=f,e.afterRender=h,e.updateBadges=g,e.setConnectionStatus=o,e.updateStatus=a,e.openNotificationAction=s,e.renderNotifications=c}function Te(e){function L(){let I=document.getElementById("content");!I||I.dataset.delegation==="1"||(I.dataset.delegation="1",I.addEventListener("click",v=>{let t=v.target.closest("[data-operator],[data-toggle-ui],[data-goto],[data-approve],[data-reject],[data-select-specialist],[data-agents-tab],[data-toggle-run],[data-memory-tab],[data-inspect-world],[data-world-graph-tab],[data-use-world],[data-set-active-world],[data-edit-world],[data-cancel-edit],[data-delete-world],[data-vault-ingest],[data-vault-link],[data-vault-search],[data-vault-facet],[data-vault-add-doc],[data-vault-cancel-doc],[data-vault-edit-doc],[data-vault-delete-doc],[data-vault-view-doc],[data-vault-reload],[data-github-add],[data-github-sync],[data-github-unlink],[data-goal-done],[data-history-tab],[data-history-session],[data-open-chat-session],[data-new-chat-session],[data-chat-session],[data-cancel-job],[data-cancel-active-job],[data-md-artifact],[data-open-document],[data-select-document],[data-docs-action],[data-tag-vault-doc],[data-nudge-index],[data-remove-attachment],[data-open-vault-picker],[data-pick-vault-doc],[data-crm-followup],[data-crm-wa-thread],[data-crm-tab],[data-crm-company-detail],[data-crm-company-close],[data-crm-import-companies],[data-crm-reload],[data-crm-outreach-start],[data-crm-campaign],[data-crm-draft-approve],[data-crm-draft-skip],[data-crm-company-toggle],[data-crm-skip-company],[data-crm-outreach-refresh],[data-crm-outreach-back],[data-msg-read-more],#chat-send,#chat-clear,#memory-search,#toggle-pause,#agents-vault-search,#delegate-selected-btn,#btn-logout,#btn-infra-refresh");if(!t)return;let f=()=>{if(t.dataset.msgReadMore){e.state._msgExpand||(e.state._msgExpand={});let h=t.dataset.msgReadMore;e.state._msgExpand[h]=(e.state._msgExpand[h]||0)+1,e.initMsgReadMore(t.closest(".msg-read-more-host")||I);return}if(t.id==="chat-send")return e.sendChat();if(t.id==="chat-clear")return e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.setChatSessionId(null),e.render();if(t.id==="memory-search")return e.searchMemory();if(t.id==="toggle-pause")return e.togglePause();if(t.id==="agents-vault-search")return e.agentsVaultSearch();if(t.id==="delegate-selected-btn")return e.delegateAgent();if(t.id==="btn-logout")return e.logoutPin();if(t.id==="btn-infra-refresh")return e.refreshInfraHealth();if(t.dataset.operator)return e.openOperatorAction(t.dataset.operator);if(t.dataset.toggleUi)return e.state.ui||(e.state.ui={}),e.state.ui[t.dataset.toggleUi]=!e.state.ui[t.dataset.toggleUi],e.render();if(t.dataset.goto)return e.goView(t.dataset.goto);if(t.dataset.approve)return e.decideApproval(t.dataset.approve,!0);if(t.dataset.reject)return e.decideApproval(t.dataset.reject,!1);if(t.dataset.selectSpecialist!==void 0)return e.selectSpecialist(t.dataset.selectSpecialist||"");if(t.dataset.agentsTab){e.state.agentsTab=t.dataset.agentsTab,localStorage.setItem("fos_agents_tab",e.state.agentsTab),e.render(),e.state.agentsTab==="vault"?e.onWorldContextChanged({vaultWorldId:e.currentWorldId(),forceVault:!1}).then(()=>e.patchAgentsVaultPanel()):e.drawGraphs();return}if(t.dataset.toggleRun){let h=t.dataset.toggleRun;return e.state.expandedRunId=e.state.expandedRunId===h?null:h,e.render()}if(t.dataset.memoryTab)return e.memoryGraphTab=t.dataset.memoryTab,e.render({graphs:!1});if(t.dataset.inspectWorld)return e.selectInspectorWorld(t.dataset.inspectWorld);if(t.dataset.worldGraphTab)return e.switchWorldGraphTab(t.dataset.worldGraphTab);if(t.dataset.useWorld)return e.setActiveWorld(t.dataset.useWorld),e.goView("chat");if(t.dataset.setActiveWorld)return e.setActiveWorld(t.dataset.setActiveWorld),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.onWorldContextChanged({vaultWorldId:t.dataset.setActiveWorld,forceVault:!0}).then(()=>e.currentView==="world"?e.patchWorldPanels():e.render({graphs:!1}));if(t.dataset.editWorld)return e.state.worldEditing=t.dataset.editWorld,e.render();if(t.dataset.cancelEdit!==void 0)return e.state.worldEditing=null,e.render();if(t.dataset.deleteWorld)return e.deleteWorld(t.dataset.deleteWorld);if(t.dataset.vaultIngest)return e.vaultIngest(t.dataset.vaultIngest);if(t.dataset.vaultLink)return e.vaultLinkRepo(t.dataset.vaultLink);if(t.dataset.vaultSearch)return e.vaultSearch(t.dataset.vaultSearch);if(t.dataset.vaultReload)return e.reloadVaultFromServer(t.dataset.vaultReload);if(t.dataset.vaultFacet)return e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=t.dataset.vaultFacet,e.patchWorldPanels();if(t.dataset.vaultAddDoc!==void 0)return e.state.ui||(e.state.ui={}),e.state.ui.vaultDocForm=!0,e.state.ui.vaultDocEdit=null,e.patchWorldPanels();if(t.dataset.vaultCancelDoc!==void 0)return e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),e.patchWorldPanels();if(t.dataset.vaultEditDoc)return e.startVaultDocEdit(e.inspectorWorldId(),t.dataset.vaultEditDoc);if(t.dataset.vaultViewDoc){let h=t.dataset.worldId||e.inspectorWorldId(),g=t.dataset.vaultViewDoc;return g?e.openVaultDocViewer(h,g,t.dataset.docTitle||"Document"):void 0}if(t.dataset.tagVaultDoc)return e.tagVaultDocInChat(t.dataset.tagVaultDoc,t.dataset.worldId,t.dataset.docTitle,t.dataset.docPath);if(t.dataset.nudgeIndex!==void 0)return e.handleNudgeAction(t.dataset.nudgeIndex);if(t.dataset.removeAttachment!==void 0){let h=Number(t.dataset.removeAttachment);return Number.isNaN(h)||e.state._chatAttachments?.splice(h,1),e.render()}if(t.dataset.openVaultPicker!==void 0)return e.openVaultAttachPicker().catch(h=>alert(h.message));if(t.dataset.pickVaultDoc){e.tagVaultDocInChat(t.dataset.pickVaultDoc,t.dataset.worldId,t.dataset.docTitle,t.dataset.docPath),e.$("#vault-picker-dialog")?.close();return}if(t.dataset.crmTab)return e.state.ui||(e.state.ui={}),e.state.ui.crmTab=t.dataset.crmTab,localStorage.setItem("fos_crm_tab",e.state.ui.crmTab),e.loadCrmData().then(()=>e.render());if(t.dataset.crmOutreachRefresh!==void 0){let h=e.state.ui?.crmCampaignId;return h?e.pollCrmOutreachJob(h,!0):e.loadCrmData().then(()=>e.render())}if(t.dataset.crmCompanyDetail)return e.openCrmCompanyDetail(t.dataset.crmCompanyDetail);if(t.dataset.crmCompanyClose!==void 0)return e.state.ui&&(e.state.ui.crmCompanyDetail=null),e.state._crmCompanyDetail=null,e.render();if(t.dataset.crmImportCompanies!==void 0)return e.importCrmCompaniesFromContacts();if(t.dataset.crmReload!==void 0)return e.loadCrmData().then(()=>e.render());if(t.dataset.crmFollowup)return e.scheduleCrmFollowup(t.dataset.crmFollowup,t.dataset.followupDays);if(t.dataset.crmWaThread)return e.loadCrmWaThread(t.dataset.crmWaThread);if(t.dataset.crmCampaign)return e.openCrmCampaignReview(t.dataset.crmCampaign);if(t.hasAttribute("data-crm-outreach-back"))return e.closeCrmCampaignReview();if(t.dataset.crmDraftApprove)return e.approveCrmDraft(t.dataset.crmDraftApprove);if(t.dataset.crmDraftSkip)return e.skipCrmDraft(t.dataset.crmDraftSkip);if(t.dataset.crmSkipCompany)return e.skipCrmCompany(t.dataset.crmSkipCompany);if(t.dataset.reminderDone)return e.updateReminderStatus(t.dataset.reminderDone,"done");if(t.dataset.reminderCancel)return e.updateReminderStatus(t.dataset.reminderCancel,"cancelled");if(t.dataset.notifAction)return e.openNotificationAction(t.dataset.notifAction,t.dataset.notifId);if(t.dataset.vaultDeleteDoc)return e.deleteVaultDoc(e.inspectorWorldId(),t.dataset.vaultDeleteDoc);if(t.dataset.githubAdd)return e.connectGithubRepo(t.dataset.githubAdd);if(t.dataset.githubSync)return e.syncGithubRepo(t.dataset.worldId,t.dataset.githubSync);if(t.dataset.githubUnlink)return e.unlinkGithubRepo(t.dataset.worldId,t.dataset.githubUnlink);if(t.dataset.goalDone)return e.markGoalDone(t.dataset.goalDone);if(t.dataset.historyTab)return e.historyTab=t.dataset.historyTab,localStorage.setItem("fos_history_tab",e.historyTab),e.render();if(t.dataset.historySession)return e.loadHistorySession(t.dataset.historySession);if(t.dataset.openChatSession)return e.setChatSessionId(t.dataset.openChatSession),e.loadChatFromServer().then(()=>e.goView("chat"));if(t.hasAttribute("data-new-chat-session"))return e.setChatSessionId(null),e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.loadChatSessionsList().then(()=>{e.currentView==="chat"?e.render():e.goView("chat")});if(t.dataset.chatSession)return e.setChatSessionId(t.dataset.chatSession),e.loadChatFromServer().then(()=>e.render());if(t.dataset.cancelJob)return e.cancelActiveJob(t.dataset.cancelJob);if(t.dataset.cancelActiveJob!==void 0)return e.cancelActiveJob();if(t.dataset.openDocument)return e.openDocumentsWorkspace(Number(t.dataset.openDocument));if(t.dataset.mdArtifact)return e.openDocumentsWorkspace(Number(t.dataset.mdArtifact));if(t.dataset.selectDocument)return e.selectDocument(t.dataset.selectDocument);if(t.dataset.docsAction){let h=t.dataset.docsAction;if(h==="new")return e.createNewDocument().catch(g=>alert(g.message));if(h==="toggle")return e.documentsEditMode&&(e.state._documentDraft=document.getElementById("docs-source")?.value??e.state._documentDraft),e.documentsEditMode=!e.documentsEditMode,e.render();if(h==="save")return e.saveCurrentDocument().catch(g=>alert(g.message));if(h==="memory")return e.saveDocumentToMemory().catch(g=>alert(g.message))}};return e.shouldSkipActionBusy(t)?f():e.runWithActionBusy(f,t)}),I.addEventListener("submit",v=>{let t=v.target;if(!(t instanceof HTMLFormElement))return;let f={"world-create-form":e.createWorldFromForm,"crm-create-form":e.submitCrmContact,"crm-company-form":e.submitCrmCompany,"crm-outreach-form":e.submitCrmOutreach,"goal-create-form":e.submitGoal,"reminder-create-form":e.submitReminder,"agent-config-form":e.saveAgentConfig,"world-edit-form":e.saveWorldEdit,"vault-doc-form":e.submitVaultDoc};if(f[t.id]){v.preventDefault();let h=t.querySelector('[type="submit"]');e.runWithActionBusy(()=>f[t.id](t),h)}}),I.addEventListener("change",v=>{if(v.target.id==="chat-file")return e.uploadFile(v);if(v.target.id==="docs-upload"){let t=v.target.files?.[0];t&&e.uploadDocumentFile(t).catch(f=>alert(f.message)),v.target.value="";return}if(v.target.id==="specialist-select-agents"||v.target.id==="chat-specialist-select")return e.selectSpecialist(v.target.value);if(v.target.id==="rag-mode-select"){e.state.ragMode=v.target.value||"auto",localStorage.setItem("fos_rag_mode",e.state.ragMode);return}if(v.target.matches("[data-crm-status]")&&e.updateCrmStatus(v.target.dataset.crmStatus,v.target.value),v.target.matches("[data-crm-whatsapp]")&&e.updateCrmWhatsapp(v.target.dataset.crmWhatsapp,v.target.checked),v.target.matches("[data-crm-company-toggle]")&&e.toggleCrmOutreachCompany(v.target),v.target.id==="crm-outreach-batch"){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachBatch=parseInt(v.target.value,10)||5;let t=e.state.ui.crmOutreachSelected||[];t.length>e.state.ui.crmOutreachBatch&&(e.state.ui.crmOutreachSelected=t.slice(0,e.state.ui.crmOutreachBatch)),e.render()}v.target.id==="crm-outreach-world"&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld=v.target.value,e.state.ui.crmOutreachSelected=[],e.loadCrmData().then(()=>e.render()))}),I.addEventListener("blur",v=>{if(v.target.matches(".crm-draft-subject, .crm-draft-body")){let t=v.target.dataset.draftId;t&&e.saveCrmDraftEdits(t).catch(()=>{})}},!0),I.addEventListener("keydown",v=>{v.target.id==="chat-input"&&v.key==="Enter"&&!v.shiftKey&&(v.preventDefault(),e.sendChat()),v.target.id==="memory-q"&&v.key==="Enter"&&e.searchMemory()}),I.addEventListener("input",v=>{if(v.target.matches(".crm-draft-body[data-channel='whatsapp']")){let t=v.target.dataset.draftId,f=document.querySelector(`.crm-wa-count[data-draft-id="${t}"]`);f&&(f.textContent=`${v.target.value.length}/300`)}v.target.id==="delegate-selected"&&(e.state._delegateDraft=v.target.value)}))}e.initContentDelegation=L}function Pe(e){function L(t="rag-mode-select"){let f=e.RAG_MODES.map(h=>`<option value="${e.esc(h.id)}" title="${e.esc(h.hint)}">${e.esc(h.label)}</option>`).join("");return`<label class="chat-control">
      <span class="caption-uppercase">Retrieval</span>
      <select id="${e.esc(t)}" class="world-select agent-select" aria-label="RAG mode">${f}</select>
    </label>`}function I(){requestAnimationFrame(()=>{let t=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),f=t?.[t.length-1];FOSMotion?.animateNewMessage?.(f)})}function v(t={}){let f=e.$("#content");if(!f)return;let h={dashboard:e.renderDashboard,chat:e.renderChat,agents:e.renderAgents,world:e.renderWorld,approvals:e.renderApprovals,crm:e.renderCrm,goals:e.renderGoals,memory:e.renderMemory,history:e.renderHistory,documents:e.renderDocuments,tools:e.renderTools,activity:e.renderActivity,settings:e.renderSettings};try{if(e.state._viewLoading)f.innerHTML=e.renderViewSkeleton(e.currentView);else{let o=h[e.currentView]||e.renderDashboard;f.innerHTML=o()}}catch(o){console.error("render failed:",o),f.innerHTML=`<div class="driver-card span-12">
        <p class="title-md">Dashboard could not render</p>
        <p class="body-md muted" style="margin-top:8px">${e.esc(o?.message||String(o))}</p>
        <button type="button" class="button-primary button-sm" id="render-retry" style="margin-top:12px">Retry</button>
      </div>`,e.$("#render-retry")?.addEventListener("click",()=>e.boot());return}document.querySelector(".content")?.classList.toggle("content--worlds",e.currentView==="world"),document.querySelector(".content")?.classList.toggle("content--wide",["agents","world","activity","chat","history","documents"].includes(e.currentView)),document.querySelector(".content")?.classList.toggle("content--chat",e.currentView==="chat"),e.populateSpecialistSelect();let g=e.$("#rag-mode-select");if(g&&(g.value=e.state.ragMode||"auto"),t.post!==!1&&(e.afterRender({graphs:t.graphs!==!1}),e.state._scrollWorldCreate&&e.currentView==="world"&&(e.state._scrollWorldCreate=!1,requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"})))),e.currentView==="chat"){let o=e.$("#chat-messages");o&&(o.scrollTop=o.scrollHeight)}}e.renderRagModeSelect=L,e.animateLatestChatMessage=I,e.render=v}function We(e){function L(a){console.error(`${e.APP_NAME} boot failed:`,a),e.setConnectionStatus("Offline","paused");let s=e.esc(a?.message||String(a));e.$("#content").innerHTML=`<div class="driver-card span-12">
      <p class="title-md">Could not connect to ${e.esc(e.APP_NAME)}</p>
      <p class="body-md muted" style="margin-top:8px">${s}</p>
      <p class="body-md muted" style="margin-top:12px">Make sure <code>python main.py</code> is running, then tap <strong>Refresh</strong> in the top bar.</p>
    </div>`}function I(a,s){let c=e.$("#pin-gate"),r=document.querySelector(".app"),b=e.$("#pin-error"),R=e.$("#pin-input");c&&(c.hidden=!1,c.classList.add("is-visible")),r&&r.setAttribute("inert",""),b&&(a?(b.textContent=a,b.hidden=!1):(b.hidden=!0,b.textContent="")),R&&!s&&(R.disabled=!1,R.focus()),R&&s&&(R.disabled=!0,b&&(b.textContent=`Too many attempts. Wait ${s}s.`,b.hidden=!1)),e.setConnectionStatus("Locked","paused")}function v(){let a=e.$("#pin-gate"),s=document.querySelector(".app");a&&(a.hidden=!0,a.classList.remove("is-visible")),s&&s.removeAttribute("inert")}async function t(){return(await fetch("/api/auth/status",{credentials:"same-origin",headers:{Accept:"application/json"}})).json()}function f(){window.__FOS_PIN_BOUND||(window.__FOS_PIN_BOUND=!0,e.$("#pin-form")?.addEventListener("submit",async a=>{a.preventDefault();let s=(e.$("#pin-input")?.value||"").trim(),c=e.$("#pin-error");if(!/^\d{6}$/.test(s)){c&&(c.textContent="Enter exactly 6 digits",c.hidden=!1);return}try{let r=await fetch("/api/auth/pin",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:s})}),b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.error||"Incorrect PIN");e.hidePinGate(),e.$("#pin-input").value="",c&&(c.hidden=!0),await e.startApp()}catch(r){c&&(c.textContent=r.message,c.hidden=!1);let b=await e.fetchAuthStatus().catch(()=>({}));b.locked_seconds&&e.showPinGate(r.message,b.locked_seconds)}}),e.$("#pin-input")?.addEventListener("input",a=>{a.target.value=a.target.value.replace(/\D/g,"").slice(0,6)}))}function h(){let a=new URLSearchParams(location.search),s=a.get("view"),c=a.get("world");if(s&&(e.currentView=s),c&&(e.state.inspectorWorldId=c,e.setActiveWorld(c)),a.get("github")==="connected"||a.get("github_error")){let r=a.get("github_error");r&&console.warn("GitHub auth:",r),history.replaceState({},"",location.pathname)}}async function g(){try{await e.refresh(!0)}catch(s){e.showBootError(s);return}e.applyBootUrlParams(),e.syncMobileNav(e.currentView);let a=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1});try{if(await e.loadViewData(e.currentView),a!==e.viewDataLoadGen)return;e.setViewLoading(!1),e.render()}catch(s){console.error(s),a===e.viewDataLoadGen&&e.setViewLoading(!1)}e.startLivePoll(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function o(){e.initContentDelegation(),e.initMdEditorDialog(),e.bindPinGate();let a=window.__FOS_AUTH;if(!a)try{a=await e.fetchAuthStatus()}catch(s){e.showBootError(s);return}if(a.pin_required&&!a.authenticated){e.showPinGate(null,a.locked_seconds||0);return}e.hidePinGate(),await e.startApp()}e.showBootError=L,e.showPinGate=I,e.hidePinGate=v,e.fetchAuthStatus=t,e.bindPinGate=f,e.applyBootUrlParams=h,e.startApp=g,e.boot=o}function Me(e){e.$$(".nav button").forEach(g=>g.addEventListener("click",()=>e.goView(g.dataset.view))),e.$("#btn-sidebar-open")?.addEventListener("click",e.openSidebar);let L=document.querySelector(".app"),I=e.$("#btn-sidebar-collapse"),v="fos_sidebar_collapsed";localStorage.getItem(v)==="1"&&L?.classList.add("sidebar-collapsed");let t=()=>{let g=L?.classList.contains("sidebar-collapsed");I?.setAttribute("aria-label",g?"Expand sidebar":"Collapse sidebar"),I?.setAttribute("title",g?"Expand sidebar":"Collapse sidebar")};t(),I?.addEventListener("click",()=>{L?.classList.toggle("sidebar-collapsed"),localStorage.setItem(v,L?.classList.contains("sidebar-collapsed")?"1":"0"),t()}),e.$("#vault-picker-close")?.addEventListener("click",()=>e.$("#vault-picker-dialog")?.close()),e.$("#vault-picker-dialog")?.addEventListener("click",g=>{g.target.id==="vault-picker-dialog"&&e.$("#vault-picker-dialog").close()}),e.$("#sidebar-close")?.addEventListener("click",e.closeMobileShell),e.$("#sidebar-backdrop")?.addEventListener("click",e.closeMobileShell),document.querySelectorAll(".mobile-tab").forEach(g=>{g.addEventListener("click",()=>{let o=g.dataset.mobileView;o==="more"?(e.syncMobileNav(e.currentView),document.getElementById("mobile-menu-drawer")?.showModal()):e.goView(o)})}),document.querySelectorAll(".mobile-menu-link").forEach(g=>{g.addEventListener("click",()=>e.goView(g.dataset.view))});let f=e.$("#mobile-menu-drawer");e.$("#mobile-menu-close")?.addEventListener("click",()=>f?.close()),f?.addEventListener("click",g=>{g.target===f&&f.close()}),e.$("#btn-refresh")?.addEventListener("click",async()=>{await e.refresh();let g=++e.viewDataLoadGen;e.setViewLoading(!0);try{await e.loadViewData(e.currentView),g===e.viewDataLoadGen&&e.render()}finally{g===e.viewDataLoadGen&&e.setViewLoading(!1)}}),window.addEventListener("resize",()=>{window.innerWidth>900&&e.closeMobileShell()});let h=e.$("#notif-drawer");e.$("#btn-notifications")?.addEventListener("click",()=>{e.renderNotifications(),h?.showModal()}),h?.addEventListener("click",g=>{g.target===h&&h.close()}),e.$("#notif-read-all")?.addEventListener("click",async()=>{await e.api("/notifications/read-all",{method:"POST"}),await e.refresh(),e.renderNotifications(),e.updateBadges()}),e.$("#world-select")?.addEventListener("change",async g=>{let o=g.target,a=o.value||"root";o.disabled=!0;try{e.setActiveWorld(a),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.currentView==="world"&&(e.state.inspectorWorldId=a,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.patchWorldPanels()),await e.onWorldContextChanged({vaultWorldId:a,forceVault:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.state.agentsTab==="vault"?e.patchAgentsVaultPanel():e.render({graphs:!1}),e.updateWorldContextChrome()}catch(s){console.error("world switch failed:",s)}finally{o.disabled=!1}}),window.addEventListener("error",g=>{console.error("UI error:",g.error||g.message),e.state?.config?.my_name||e.setConnectionStatus("UI error \u2014 hard refresh","paused")}),document.addEventListener("visibilitychange",()=>{document.hidden?(e.refreshTimer&&(clearTimeout(e.refreshTimer),e.refreshTimer=null),e.stopLivePoll()):(e.scheduleBackgroundRefresh(),!e.livePollTimer&&e.state?.config&&e.startLivePoll())})}var H={};function nt(){ne(H),oe(H),re(H),ie(H),de(H),le(H),ce(H),pe(H),me(H),ue(H),he(H),ge(H),fe(H),be(H),ve(H),ye(H),we(H),_e(H),$e(H),Se(H),ke(H),Ce(H),Ie(H),Ae(H),Le(H),Re(H),Oe(H),De(H),Te(H),Pe(H),We(H)}nt();Me(H);window.__FOS=H;Object.defineProperty(window,"currentView",{get:()=>H.currentView,set:e=>{H.currentView=e}});window.drawGraphs=(...e)=>H.drawGraphs(...e);window.drawDashboardCharts=(...e)=>H.drawDashboardCharts(...e);window.render=(...e)=>H.render(...e);H.boot();H.scheduleBackgroundRefresh();
