var qe=(e,S=document)=>S.querySelector(e),Je=(e,S=document)=>[...S.querySelectorAll(e)];function ie(e){e.$=qe,e.$$=Je}function Ke(e){let S=document.createElement("div");return S.textContent=e??"",S.innerHTML}function ze(e){return"$"+Number(e||0).toLocaleString(void 0,{maximumFractionDigits:0})}function Ye(e){return e?new Date(typeof e=="number"&&e<1e12?e*1e3:e).toLocaleString():""}function Qe(e){return new Promise(S=>setTimeout(S,e))}function le(e){e.esc=Ke,e.fmtMoney=ze,e.fmtTime=Ye,e.sleep=Qe}function Xe(e,S){try{let k=localStorage.getItem(e);return k?JSON.parse(k):S}catch(k){return console.warn(`[storage] corrupt ${e}, resetting`,k),localStorage.removeItem(e),S}}function de(e){e.readJsonStorage=Xe}var Ze="Nawab OS",xe=[{id:"pulse",label:"Pulse",role:"aggregator",tool_count:0,brief:"Operating pulse across parallel projects"},{id:"outreach",label:"Outreach",role:"outreach",tool_count:0,brief:"Outreach drafts and CRM pipeline"},{id:"leads",label:"Leads",role:"leads",tool_count:0,brief:"Lead lists and contact priorities"},{id:"market",label:"Market intel",role:"research",tool_count:0,brief:"Industry and competitor intelligence"},{id:"vault",label:"Vault",role:"knowledge",tool_count:0,brief:"Knowledge vault librarian"}],et=[{id:"auto",label:"Auto",hint:"Agent picks retrieval"},{id:"hybrid",label:"Hybrid RAG",hint:"Dense + BM25 fusion"},{id:"graphrag",label:"GraphRAG",hint:"Knowledge graph communities"},{id:"vault",label:"Vault",hint:"World knowledge vault"},{id:"documents",label:"Documents",hint:"Ingested document store"}],tt={dashboard:"Control center",chat:"Ask agent",agents:"Agent fleet",world:"Worlds",approvals:"Approvals",crm:"CRM & pipeline",outreach:"Outreach",goals:"Goals & tasks",memory:"Memory",documents:"Documents",history:"History",tools:"Tools",activity:"Activity",settings:"Settings"},at=["prospect","contacted","replied","meeting","won","lost","nurture"],st=["prospect","contacted","responded","meeting_set","closed","dead"],nt=["#f75440","#00666b","#03904a","#051f13","#5a403c","#8f706b","#e3beb8"],ot=15,rt=30,it=5e3,lt=3e4,dt=3e4,ct={aggregator:{label:"Aggregator",cls:"agent-role--aggregator",avatar:"agent-avatar--aggregator"},outreach:{label:"Outreach",cls:"agent-role--outreach",avatar:"agent-avatar--outreach"},leads:{label:"Leads",cls:"agent-role--leads",avatar:"agent-avatar--leads"},research:{label:"Intel",cls:"agent-role--research",avatar:"agent-avatar--research"},knowledge:{label:"Vault",cls:"agent-role--vault",avatar:"agent-avatar--knowledge"}},ut={supervisor:"SV",pulse:"PL",outreach:"OR",leads:"LD",market:"MK",vault:"VL"},pt={root:{label:"Main",cls:"world-kind--root"},project:{label:"Startup",cls:"world-kind--project"},startup:{label:"Startup",cls:"world-kind--project"},technical:{label:"Technical",cls:"world-kind--research"},idea:{label:"Idea",cls:"world-kind--idea"},research:{label:"Research",cls:"world-kind--research"}};function ce(e){Object.assign(e,{APP_NAME:Ze,DEFAULT_SPECIALISTS:xe,RAG_MODES:et,TITLES:tt,CRM_STATUSES:at,COMPANY_STATUSES:st,CHART_COLORS:nt,MSG_READ_INITIAL_LINES:ot,MSG_READ_EXPAND_LINES:rt,LIVE_POLL_MS:it,LIVE_POLL_HIDDEN_MS:lt,REFRESH_MS:dt,AGENT_ROLES:ct,AGENT_INITIALS:ut,WORLD_KINDS:pt})}function ue(e){async function S(b,s,g="POST"){let c=await fetch("/api"+b,{method:g,body:s,credentials:"same-origin"}),m=await c.json().catch(()=>({}));if(c.status===401&&m.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!c.ok)throw new Error(m.error||c.statusText);return m}async function k(b,s={}){let g=new AbortController,c=s.timeoutMs??3e4,m=setTimeout(()=>g.abort(),c),{timeoutMs:o,headers:t,signal:a,...d}=s;try{let r=await fetch("/api"+b,{...d,credentials:"same-origin",headers:{"Content-Type":"application/json",...t||{}},signal:a||g.signal}),f=await r.json().catch(()=>({}));if(r.status===401&&f.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!r.ok)throw new Error(f.error||r.statusText);return f}catch(r){throw r.name==="AbortError"?new Error("Request timed out \u2014 is the server running?"):r}finally{clearTimeout(m)}}e.api=k,e.apiUpload=S}function pe(e){function S(){let k=localStorage.getItem("fos_selected_specialist");if(k!==null)return k;let b=localStorage.getItem("fos_selected_agent");return b&&b!=="supervisor"?b:""}e.state={live:{},selectedSpecialist:S(),ragMode:localStorage.getItem("fos_rag_mode")||"auto",activeWorldId:localStorage.getItem("fos_active_world")||"root",agentsTab:localStorage.getItem("fos_agents_tab")||"runs",expandedRunId:null,ui:{worldCreateOpen:!1,crmFormOpen:!1,goalsFormOpen:!1,reminderFormOpen:!1,vaultFacet:null,vaultDocForm:null,vaultDocEdit:null},_worldTemplates:null,_operations:{},_chatAttachments:[]},e.state._syncingLinkIds=new Set,e.currentView="dashboard",e.chatHistory=e.readJsonStorage("fos_chat",[]),e.historyTab=localStorage.getItem("fos_history_tab")||"conversations",e.documentsEditMode=!1,e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.livePollTimer=null,e._runtimePollTick=0,e.whatsappPollTimer=null,e.memoryGraphTab="graph",e.worldGraphTab="hierarchy",e.lastLiveActive=!1,e.viewDataLoadGen=0,e.vaultLoadGen=0,e.graphDrawCache={},e.actionBusyDepth=0,e.actionBusyButton=null,e._actionOwnedLoading=!1,e.refreshTimer=null,e.loadSelectedSpecialist=S}function me(e){function S(){let d=e.state.config||{};return d.my_name?`${d.my_name}'s ${e.APP_NAME}`:e.APP_NAME}function k(){return e.state.activeWorldId||e.$("#world-select")?.value||"root"}function b(){let d=e.state.worlds||e.state._worldFull?.worlds||{},r=e.currentWorldId();return r==="root"?d.root?.name||"Main world":(d.children||[]).find(R=>R.id===r)?.name||r}function s(d){e.state.activeWorldId=d||"root",localStorage.setItem("fos_active_world",e.state.activeWorldId),e.populateWorldSelect(),e.updateWorldContextChrome()}function g(){let d=e.$("#world-select");if(!d)return;let r=e.state.activeWorldId||"root";[...d.options].some(f=>f.value===r)&&(d.value=r)}function c(){let d=e.activeWorldLabel();document.querySelectorAll("[data-active-world-label]").forEach(r=>{r.textContent=d}),e.syncWorldSelectValue(),e.currentView==="world"&&e.patchWorldTreeNav()}function m(){let d=e.$("#specialist-select-agents")?.value??e.state.selectedSpecialist??"";return d==="auto"?"":d||""}function o(){return e.$("#rag-mode-select")?.value||e.state.ragMode||"auto"}function t(){return!!e.currentSpecialistId()}function a(){let d=e.$("#world-select");if(!d)return;let r=e.state.worlds||e.state._worldFull?.worlds||{},f=r.root,R=r.children||[],A=R.map(w=>`<option value="${e.esc(w.id)}">${e.esc(w.name)} \xB7 ${e.esc(w.kind||"project")}</option>`).join("");d.innerHTML=`
      <optgroup label="Main">
        <option value="root">${e.esc(f?.name||"Main world")} \u2014 all context</option>
      </optgroup>
      ${R.length?`<optgroup label="Sub-worlds">${A}</optgroup>`:""}`;let y=e.state.activeWorldId||"root";[...d.options].some(w=>w.value===y)?d.value=y:(d.value="root",e.state.activeWorldId="root",localStorage.setItem("fos_active_world","root"))}e.ownerLabel=S,e.currentWorldId=k,e.activeWorldLabel=b,e.setActiveWorld=s,e.syncWorldSelectValue=g,e.updateWorldContextChrome=c,e.currentSpecialistId=m,e.currentRagMode=o,e.isDirectSpecialist=t,e.populateWorldSelect=a}function he(e){function S(t,a={}){e.state._viewLoading=!!t;let d=document.getElementById("global-progress"),r=d?.querySelector(".global-progress__bar");d&&(d.hidden=!t,d.setAttribute("aria-hidden",t?"false":"true"),t&&a.progress==null?(d.classList.add("is-indeterminate"),r&&(r.style.width="")):t&&a.progress!=null?(d.classList.remove("is-indeterminate"),r&&(r.style.width=`${Math.min(100,a.progress)}%`)):(d.classList.remove("is-indeterminate"),r&&(r.style.width="0")))}function k(t){e.actionBusyDepth++,e.actionBusyDepth===1&&(e._actionOwnedLoading=!e.state._viewLoading,e._actionOwnedLoading&&e.setViewLoading(!0),document.body.classList.add("is-action-busy"));let a=t?.closest?.("button, [role='button']")||t;a&&!e.actionBusyButton&&(e.actionBusyButton=a,a.classList.add("is-loading"),a.setAttribute("aria-busy","true"),"disabled"in a&&(a.disabled=!0))}function b(t){let a=e.actionBusyButton;a&&(a.classList.remove("is-loading"),a.removeAttribute("aria-busy"),"disabled"in a&&!a.dataset.keepDisabled&&(a.disabled=!1),e.actionBusyButton=null),e.actionBusyDepth=Math.max(0,e.actionBusyDepth-1),e.actionBusyDepth===0&&(e._actionOwnedLoading&&(e.setViewLoading(!1),e._actionOwnedLoading=!1),document.body.classList.remove("is-action-busy"))}function s(t,a){e.beginActionBusy(a);try{let d=t();return d!=null&&typeof d.then=="function"?d.finally(()=>e.endActionBusy(a)):(e.endActionBusy(a),d)}catch(d){throw e.endActionBusy(a),d}}function g(t){return!!(!t||t.id==="chat-send"||t.id==="chat-clear"||t.dataset.toggleUi!==void 0||t.dataset.goto!==void 0||t.dataset.toggleRun!==void 0||t.dataset.memoryTab!==void 0||t.dataset.vaultFacet!==void 0||t.dataset.vaultAddDoc!==void 0||t.dataset.vaultCancelDoc!==void 0||t.dataset.removeAttachment!==void 0||t.dataset.historyTab!==void 0||t.dataset.pickVaultDoc!==void 0||t.dataset.cancelEdit!==void 0||t.dataset.editWorld!==void 0||t.dataset.docsAction==="toggle"||t.hasAttribute("data-outreach-save-companies")||t.matches?.("[data-crm-company-toggle]"))}function c(t="72%"){return`<span class="skeleton" style="display:block;height:12px;width:${t}"></span>`}function m(t=3){return`<div class="skeleton-card driver-card">${Array.from({length:t},(d,r)=>e.skeletonLine(r===0?"38%":"88%")).join("")}</div>`}function o(t){let a=`<div class="skeleton-grid">${e.skeletonCard(2)}${e.skeletonCard(2)}${e.skeletonCard(2)}</div>`;return t==="dashboard"?`<div class="view-skeleton dashboard-grid">${e.skeletonCard(2)}<div class="span-8">${e.skeletonCard(4)}</div><div class="span-4">${e.skeletonCard(2)}</div>${a}</div>`:t==="chat"?`<div class="view-skeleton"><div class="skeleton-card driver-card">${e.skeletonLine("30%")}${e.skeletonLine("60%")}</div><div class="skeleton-card driver-card" style="min-height:280px">${e.skeletonLine("100%")}${e.skeletonLine("92%")}${e.skeletonLine("78%")}</div></div>`:t==="world"?`<div class="view-skeleton dashboard-grid"><div class="span-4">${e.skeletonCard(3)}</div><div class="span-8">${e.skeletonCard(5)}</div>${a}</div>`:t==="documents"?`<div class="view-skeleton docs-workspace"><div class="skeleton-card driver-card">${e.skeletonCard(4)}</div><div class="skeleton-card driver-card">${e.skeletonCard(6)}</div></div>`:t==="outreach"?`<div class="view-skeleton">${e.skeletonCard(2)}${e.skeletonCard(4)}</div>`:`<div class="view-skeleton">${e.skeletonCard(3)}${a}</div>`}e.setViewLoading=S,e.beginActionBusy=k,e.endActionBusy=b,e.runWithActionBusy=s,e.shouldSkipActionBusy=g,e.skeletonLine=c,e.skeletonCard=m,e.renderViewSkeleton=o}function ge(e){function S(){e.state._worldVault=null,e.state._vaultGraph=null,e.state._vaultWorldId=null,e.state._vaultLoading=!1}function k(){return e.state._worldVault?.vault||e.state._worldVault||null}function b(a){return!!(a&&a!=="root"&&e.state._vaultWorldId===a&&e.vaultPayload())}function s(a,d=""){if(!a)return`${d}:empty`;let r=a.nodes||[],f=a.edges||[],R=a.meta||{},A=r.slice(0,12).map(y=>`${y.data?.id}:${y.data?.label}`).join("|");return`${d}:${r.length}:${f.length}:${R.updated||""}:${R.document_count||""}:${A}`}function g(...a){if(!a.length){Object.keys(e.graphDrawCache).forEach(d=>delete e.graphDrawCache[d]);return}a.forEach(d=>delete e.graphDrawCache[d])}function c(a,d,r={},f="Nothing to visualize yet."){if(!window.FOSGraph)return null;let R=document.getElementById(a);if(!R)return null;let A=R.parentElement?.querySelector(`[data-graph-placeholder-for="${a}"]`);A||(A=document.createElement("p"),A.className="graph-placeholder body-md muted",A.dataset.graphPlaceholderFor=a,R.insertAdjacentElement("afterend",A));let y=d?.nodes||[],w=d?.edges||[],O=y.length===1&&y[0]?.data?.type==="empty",D=y.length===1&&y[0]?.data?.type==="loading",G=y.length+w.length>0&&!O&&!D,q=e.graphDataSignature(d,`${a}:${r.layout?.name||"default"}:${r.onSelect?"interactive":"static"}`),K=null;return G?e.graphDrawCache[a]===q&&FOSGraph.getCy(a)&&!r.onSelect?K=FOSGraph.getCy(a):(K=FOSGraph.render(a,d,r),e.graphDrawCache[a]=q):(FOSGraph.destroy(a),delete e.graphDrawCache[a]),K?(R.classList.remove("is-empty"),A.hidden=!0):(R.classList.add("is-empty"),A.hidden=!1,A.textContent=D?y[0]?.data?.label||"Loading\u2026":f),K}function m(a){e.worldGraphTab=a,document.querySelectorAll("[data-world-graph-tab]").forEach(r=>{r.classList.toggle("is-active",r.dataset.worldGraphTab===a)});let d=document.getElementById("world-graph-legend");d&&(d.innerHTML=e.worldGraphLegendHtml(a)),e.drawGraphs()}async function o(){if(window.FOSGraph){try{window.FOSVendors&&await window.FOSVendors.ensure(["cytoscape"])}catch(a){console.warn("cytoscape load failed:",a);return}if(e.currentView==="dashboard"&&e.state._runtimeGraph&&e.renderGraphOrPlaceholder("graph-runtime-dash",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:20}},"Runtime graph appears when an agent is active."),e.currentView==="agents"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-agents")&&e.renderGraphOrPlaceholder("graph-runtime-agents",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="chat"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-chat")&&e.renderGraphOrPlaceholder("graph-runtime-chat",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="world"){let a=e.worldById(e.inspectorWorldId());if(e.worldGraphTab==="vault"&&!e.isRootWorld(a))e.renderGraphOrPlaceholder("graph-world",e.vaultGraphForWorld(a),{layout:FOSGraph.HIERARCHY_LAYOUT,onSelect:d=>{d.facet_id&&(e.state.ui={...e.state.ui||{},vaultFacet:d.facet_id},e.patchWorldPanels())}},"No files yet \u2014 add documents or link a GitHub repo in the knowledge panel below.");else{let d=e.worldGraphTab==="ecosystem"?e.state._worldGraph:e.state._worldHierarchyGraph||e.state._worldGraph;d?(e.renderGraphOrPlaceholder("graph-world",d,{layout:e.worldGraphTab==="hierarchy"?FOSGraph.HIERARCHY_LAYOUT:FOSGraph.LAYOUT,onSelect:r=>{r.world_id&&e.selectInspectorWorld(r.world_id)}},"World map will appear once your hierarchy is loaded."),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())):e.renderGraphOrPlaceholder("graph-world",null,{},"World map will appear once your hierarchy is loaded.")}}e.currentView==="memory"&&e.state._memoryGraph&&e.renderGraphOrPlaceholder("graph-memory",e.state._memoryGraph,{onSelect:a=>{let d=e.$("#graph-memory-detail");d&&(d.textContent=`${a.type}: ${a.label}`)}},"Memory graph fills in as you store knowledge and run agents.")}}async function t(){let a=e.currentView;if(["dashboard","agents","chat","world"].includes(a)&&!e.state._runtimeGraph)try{e.state._runtimeGraph=await e.api("/graph/runtime")}catch{e.state._runtimeGraph=null}if(a==="world"){if(!e.state._worldFull?.graph)try{let r=await e.api("/graph/world");e.state._worldGraph=r?.graph??null,e.state._worldHierarchyGraph=r?.hierarchy_graph??null,e.state._worldPreviews=r?.world_previews??{},e.state._worldFull=r,e.invalidateGraphCache("graph-world")}catch{}}else a==="dashboard"&&e.state._world&&(e.state._worldGraph=e.state._world.graph??e.state._worldGraph??null,e.state._world.worlds&&!e.state.worlds?.root&&(e.state.worlds=e.state._world.worlds));if(a==="memory"&&!e.state._memoryFull?.graph)try{let r=await e.api("/graph/memory");e.state._memoryGraph=r.graph??null,e.state._memoryFull=r,e.invalidateGraphCache("graph-memory")}catch{}}e.clearVaultScopedState=S,e.vaultPayload=k,e.vaultReadyFor=b,e.graphDataSignature=s,e.invalidateGraphCache=g,e.renderGraphOrPlaceholder=c,e.switchWorldGraphTab=m,e.drawGraphs=o,e.loadGraphData=t}function fe(e){function S(o,t="Waiting for activity\u2026"){return o?.length?`<div class="tool-flow">${o.map((a,d)=>{let r=d>0?'<span class="tool-flow-arrow" aria-hidden="true">\u2192</span>':"";if(a.type==="phase")return`${r}<span class="tool-flow-node">${e.esc(a.label)}</span>`;let f=a.decision==="approve"?" is-approve":a.decision==="deny"?" is-deny":"";return`${r}<span class="tool-flow-node${f}">${e.esc(a.name||a.label)}</span>`}).join("")}</div>`:`<p class="body-md muted">${e.esc(t)}</p>`}function k(o,t="live-panel"){let a=o?.jobs?.length?o.jobs:o?.active?[o]:[],d=a.some(y=>y.active||y.status==="running")||o?.active,r=a[0]||o||{},f=r.events||o?.events||[],R=f.map((y,w)=>`<option value="${w}"${w===f.length-1?" selected":""}>${e.esc(y.label||y.name||"Step")}</option>`).join(""),A=a.length?a.map(y=>`
      <div class="live-job${y.active||y.status==="running"?" is-active":""}">
        <div class="live-job__head">
          <span class="mono">${e.esc(y.specialist||y.mode||"agent")}</span>
          <span class="muted">${y.elapsed_s||0}s</span>
        </div>
        <p class="live-job__phase">${e.esc(y.phase||"Working\u2026")}</p>
        ${y.active||y.status==="running"?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(y.id)}">Stop</button>`:`<span class="badge-pill">${e.esc(y.status||"done")}</span>`}
      </div>`).join(""):"";return`<section class="live-panel${d?" is-active":""}" id="${t}" aria-live="polite">
      <div class="live-panel__head">
        <p class="caption-uppercase">Live operation</p>
        ${d&&r.id?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(r.id)}">Stop</button>`:""}
      </div>
      <p class="live-phase" id="${t}-phase">${e.esc(r.phase||o?.phase||"Idle \u2014 send a message or delegate a task")}</p>
      ${f.length?`<label class="live-phase-select"><span class="caption-uppercase">Step</span>
        <select class="world-select" id="${t}-step" aria-label="Current step">${R}</select></label>`:""}
      <div id="${t}-flow">${e.renderLiveFlow(f)}</div>
      ${A?`<div class="live-jobs">${A}</div>`:""}
      ${d&&o?.elapsed_s?`<p class="world-meta">${o.elapsed_s}s elapsed \xB7 ${e.esc(o.actor||r.specialist||"")}</p>`:""}
    </section>`}function b(o){let t=e.$("#live-strip"),a=e.$("#live-strip-text");if(!t)return;let d=!!o?.active;d!==e.lastLiveActive&&(FOSMotion?.pulseLiveStrip?.(d),e.lastLiveActive=d),a&&d&&(a.textContent=o.phase||"Agent working\u2026")}function s(o){e.state.live=o||{},e.updateLiveStrip(o),e.$$("[id$='-phase']").forEach(t=>{t.textContent=o?.phase||"Idle"}),e.$$("[id$='-flow']").forEach(t=>{t.innerHTML=e.renderLiveFlow(o?.events||[])}),e.$$(".live-panel").forEach(t=>t.classList.toggle("is-active",!!o?.active))}async function g(){try{let o=await e.api("/live",{timeoutMs:15e3});if(e.state.live=o,e.patchLiveUI(o),["dashboard","agents","chat"].includes(e.currentView)&&(o?.active||e._runtimePollTick++%4===0)){let a=e.graphDataSignature(e.state._runtimeGraph,"runtime");e.state._runtimeGraph=await e.api("/graph/runtime").catch(()=>e.state._runtimeGraph);let d=e.graphDataSignature(e.state._runtimeGraph,"runtime");a!==d&&(e.invalidateGraphCache("graph-runtime-dash","graph-runtime-agents","graph-runtime-chat"),e.drawGraphs())}}catch{}}function c(){e.stopLivePoll(),e._runtimePollTick=0,e.pollLive(),e.scheduleLivePoll()}function m(){e.livePollTimer&&(clearTimeout(e.livePollTimer),e.livePollTimer=null)}e.renderLiveFlow=S,e.renderLivePanel=k,e.updateLiveStrip=b,e.patchLiveUI=s,e.pollLive=g,e.startLivePoll=c,e.stopLivePoll=m}function be(e){function S(g){return e.state._syncingLinkIds.has(String(g))}function k(){let g=document.getElementById("ops-stack");if(!g)return;let c=Date.now(),m=Object.values(e.state._operations||{}).filter(o=>o.status==="running"||o.finishedAt&&c-o.finishedAt<8e3).slice(0,5);if(!m.length){g.innerHTML="",g.hidden=!0;return}g.hidden=!1,g.innerHTML=m.map(o=>{let t=Math.round((o.progress||0)*100),a=o.status==="running"?"is-running":o.status==="error"?"is-error":"is-done",d=o.status==="running"?"Working":o.status==="error"?"Failed":"Done";return`<div class="ops-card ${a}" data-op-id="${e.esc(o.id)}">
        <div class="ops-card__head">
          <span class="ops-card__title">${e.esc(o.title)}</span>
          <span class="ops-card__status">${d}</span>
        </div>
        <p class="ops-card__detail">${e.esc(o.detail||"")}</p>
        ${o.status==="running"?`<div class="ops-card__bar" role="progressbar" aria-valuenow="${t}" aria-valuemin="0" aria-valuemax="100"><span style="width:${t}%"></span></div>`:""}
      </div>`}).join("")}async function b(g,c,m={}){let o=g;e.state._operations[o]={id:o,title:c,detail:"Scanning repository\u2026",progress:0,status:"running"},m.linkId!=null&&e.state._syncingLinkIds.add(String(m.linkId)),e.renderOpsStack(),m.worldId&&e.currentView==="world"&&e.render();try{for(;;){let t=await e.api(`/sync-jobs/${encodeURIComponent(g)}/batch`,{method:"POST",body:JSON.stringify({batch_size:8}),timeoutMs:18e4}),a=e.state._operations[o];if(a&&(a.progress=t.progress||0,a.detail=t.message||`${t.imported||0} files imported`,a.status=t.status==="failed"?"error":t.done?"done":"running"),e.renderOpsStack(),t.done)break}}catch(t){let a=e.state._operations[o];throw a&&(a.status="error",a.detail=t.message||"Sync failed",a.finishedAt=Date.now()),e.renderOpsStack(),t}finally{let t=e.state._operations[o];t&&!t.finishedAt&&(t.finishedAt=Date.now()),m.linkId!=null&&e.state._syncingLinkIds.delete(String(m.linkId)),e.renderOpsStack();try{await e.refresh(),m.worldId&&await e.reloadVault(m.worldId,{force:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.patchAgentsVaultPanel(),e.updateBadges()}catch{}setTimeout(()=>{delete e.state._operations[o],e.renderOpsStack()},8e3)}}async function s(g){let c=await e.api(`/worlds/${encodeURIComponent(g)}/sync-jobs`).catch(()=>({jobs:[]}));for(let m of c.jobs||[])!m?.id||e.state._operations[m.id]||e.runGithubSyncJob(m.id,`Syncing ${m.full_name}`,{worldId:g,linkId:m.link_id}).catch(console.error)}e.isLinkSyncing=S,e.renderOpsStack=k,e.runGithubSyncJob=b,e.resumeActiveSyncJobs=s}function ve(e){function S(){e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit"}async function k(g,c,m){let o=e.$("#md-editor-dialog");if(!(!o||!g||!c)){e.mdEditorState={mode:"vault",artifactId:null,worldId:g,docId:c,editMode:!1},e.$("#md-dialog-title").textContent=m||"Document",e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit",e.$("#md-dialog-preview").innerHTML="<p class='body-md muted'>Loading\u2026</p>",o.showModal();try{let a=(await e.api(`/worlds/${encodeURIComponent(g)}/vault/documents/${encodeURIComponent(c)}/content`,{timeoutMs:2e4})).content||"";e.$("#md-dialog-source").value=a;let d=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(d,a)}catch(t){e.$("#md-dialog-preview").innerHTML=`<p class="body-md" style="color:var(--color-warn)">${e.esc(t.message||"Could not load document")}</p>`}}}async function b(){let g=e.$("#md-dialog-source")?.value??"";if(e.mdEditorState.mode==="vault"&&e.mdEditorState.worldId&&e.mdEditorState.docId){await e.api(`/worlds/${encodeURIComponent(e.mdEditorState.worldId)}/vault/documents/${encodeURIComponent(e.mdEditorState.docId)}`,{method:"PATCH",body:JSON.stringify({content:g}),timeoutMs:15e3});let m=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(m,g),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit";return}if(!e.mdEditorState.artifactId)return;await e.api(`/artifacts/${e.mdEditorState.artifactId}/content`,{method:"PUT",body:JSON.stringify({content:g}),timeoutMs:15e3});let c=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(c,g),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}function s(){e.$("#md-dialog-close")?.addEventListener("click",()=>{e.$("#md-editor-dialog")?.close(),e.resetMdEditorDialog()}),e.$("#md-dialog-mode")?.addEventListener("click",async()=>{if(e.mdEditorState.mode!=="vault"&&!e.mdEditorState.artifactId)return;e.mdEditorState.editMode=!e.mdEditorState.editMode;let g=e.$("#md-dialog-source"),c=e.$("#md-dialog-preview");if(e.mdEditorState.editMode)g.hidden=!1,c.hidden=!0,e.$("#md-dialog-save").hidden=!1,e.$("#md-dialog-mode").textContent="Preview";else{let m=g?.value??"";await window.FOSMarkdown?.renderInto?.(c,m),g.hidden=!0,c.hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}}),e.$("#md-dialog-save")?.addEventListener("click",()=>e.saveMdEditor().catch(g=>alert(g.message)))}e.resetMdEditorDialog=S,e.openVaultDocViewer=k,e.saveMdEditor=b,e.initMdEditorDialog=s}function ye(e){function S(){let o=e.state._nudges||[];return o.length?`<section class="driver-card span-12 up-next-panel">
      <p class="caption-uppercase">Up next</p>
      <p class="body-md muted">Reminders, follow-ups, approvals, and vault prompts for your active world.</p>
      <ul class="up-next-list">${o.slice(0,8).map((a,d)=>`
      <li class="up-next-item${(a.priority||9)<=2?" is-urgent":""}">
        <div class="up-next-item__body">
          <p class="up-next-item__title">${e.esc(a.title)}</p>
          <p class="up-next-item__meta muted">${e.esc(a.body||"")}</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-nudge-index="${d}">Open</button>
      </li>`).join("")}</ul>
    </section>`:""}function k(o){let t=e.state._nudges?.[Number(o)];if(!t)return;if(t.kind==="vault_leads"&&t.meta?.doc_id){e.tagVaultDocInChat(t.meta.doc_id,t.meta.world_id,t.title,"");return}let a=t.action||"chat";if(a==="crm")return e.goView("crm");if(a==="goals")return e.goView("goals");if(a==="approvals")return e.goView("approvals");if(a==="documents")return e.goView("documents");if(a==="world")return e.goView("world");e.goView(a)}function b(o,t,a){let d=document.getElementById(o);if(!d)return;let r=d.closest(".chart-panel");if(!r)return;let f=r.querySelector(".chart-empty");f||(f=document.createElement("p"),f.className="chart-empty muted body-md",r.appendChild(f)),f.textContent=t,f.hidden=!a,d.hidden=a}function s(){let o=window.innerWidth<640,t=e.state._world?.tools_by_category||e.state.about?.tools_by_category||{},a=Object.entries(t).slice(0,o?5:8);a.length&&e.$("#chart-tools")?(e.chartPanelNote("chart-tools","",!1),FOSCharts.bar("chart-tools",a.map(([A])=>A),a.map(([,A])=>A),{colors:e.CHART_COLORS})):e.chartPanelNote("chart-tools","No tool data yet.",!0);let d=e.state.snapshot?.crm?.by_status||{},r=Object.entries(d).filter(([,A])=>A>0).map(([A,y])=>({label:A,value:y}));r.length&&e.$("#chart-crm")?(e.chartPanelNote("chart-crm","",!1),FOSCharts.donut("chart-crm",r,{centerLabel:"contacts",colors:e.CHART_COLORS})):e.chartPanelNote("chart-crm","No CRM contacts yet \u2014 add leads in Chat or CRM.",!0);let R=[...e.state.usage_history||[]].reverse().map(A=>A.llm_calls||A.calls||0);R.length&&e.$("#chart-usage")?(e.chartPanelNote("chart-usage","",!1),FOSCharts.spark("chart-usage",R)):e.chartPanelNote("chart-usage","No LLM usage in the last 7 days.",!0)}function g(){let o=e.state.config||{},t=e.state.snapshot?.approvals_pending||0,a=o.agent_paused;return`
      <section class="driver-card span-12 operator-panel" aria-label="Direct actions">
        <div class="operator-panel__head">
          <div>
            <p class="section-eyebrow">You drive</p>
            <h3 class="title-sm">Direct controls</h3>
            <p class="body-md muted">Manage worlds, CRM, goals, and agent policy yourself. Chat is optional \u2014 use it when you want help.</p>
          </div>
          <div class="operator-panel__status">
            <span class="pill ${a?"warn":"ok"}">${a?"Agent paused":"Agent on standby"}</span>
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
          <button type="button" class="operator-card${t?" operator-card--alert":""}" data-operator="approvals">
            <span class="operator-card__title">Approvals${t?` (${t})`:""}</span>
            <span class="operator-card__desc">Review before agents act</span>
          </button>
        </div>
      </section>`}function c(o){if(e.state.ui||(e.state.ui={}),o==="create-world"){e.state.ui.worldCreateOpen=!0,e.currentView==="world"?(e.render(),requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"}))):(e.goView("world"),e.state._scrollWorldCreate=!0);return}if(o==="add-contact"){e.state.ui.crmFormOpen=!0,e.currentView==="crm"?e.render():e.goView("crm");return}if(o==="add-goal"){e.state.ui.goalsFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}if(o==="add-reminder"){e.state.ui.reminderFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}o==="settings"&&e.goView("settings"),o==="approvals"&&e.goView("approvals")}function m(){let o=e.state.snapshot||{},t=o.crm||{},a=e.state.finance||{},d=e.state.usage||{},r=e.state.about||{},f=e.state.config||{},R=o.approvals_pending||0,A=a.set?`<span class="pill ${a.status==="healthy"?"ok":a.status==="warning"?"warn":"info"}">${e.esc(a.status)}</span>`:"",y=a.set?a.runway||(a.runway_months!=null?a.runway_months+" mo":"\u2014"):null,w=(e.state.goals||[]).slice(0,5).map(q=>`<li>${e.esc(q.title)}</li>`).join("")||"<li class='muted'>No active goals \u2014 add one in Goals or use Direct controls.</li>",O=R>0?`<div class="spec-cell race-position-cell"><dt>Approvals</dt><dd>${R}</dd></div>`:'<div class="spec-cell"><dt>Approvals</dt><dd>0</dd></div>',D=e.state.live||{},G=e.state._agents||{};return`<div class="dashboard-grid">
        ${e.renderUpNext()}
        ${e.renderOperatorPanel()}
        <section class="driver-card span-8">
          ${e.renderLivePanel(D)}
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">World state</p>
          <p class="world-meta" style="margin-top:var(--space-xxs)">Updated ${e.esc(o.ts||"now")}</p>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tools</dt><dd>${r.total_tools||0}</dd></div>
            <div class="spec-cell"><dt>Agents</dt><dd>${(G.specialists?.length||4)+1}</dd></div>
            <div class="spec-cell"><dt>Contacts</dt><dd>${t.total_contacts||0}</dd></div>
            ${O}
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
          <div class="activity-timeline">${(e.state.actions||[]).slice(0,8).map(q=>`<div class="activity-timeline__row"><span class="mono">${e.esc(q.tool_name)}</span><span class="muted">${e.esc((q.created_at||"").slice(11,19))}</span></div>`).join("")||"<p class='muted'>No tool actions yet</p>"}</div>
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">Specialist status</p>
          <div class="specialist-chips">${e.listSpecialists(G).map(q=>`<span class="specialist-chip${e.agentBusy(D,q.id)?" is-busy":""}">${e.esc(q.label)}</span>`).join("")}</div>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents" style="margin-top:var(--space-sm)">Open agents</button>
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Runway ${A}</p>
          ${y?`<dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Cash</dt><dd class="small">${e.fmtMoney(a.cash)}</dd></div>
            <div class="spec-cell"><dt>Burn</dt><dd class="small">${e.fmtMoney(a.monthly_burn)}</dd></div>
            <div class="spec-cell"><dt>MRR</dt><dd class="small">${e.fmtMoney(a.mrr)}</dd></div>
            <div class="spec-cell"><dt>Runway</dt><dd class="small">${e.esc(y)}</dd></div>
          </dl>`:'<p class="body-md" style="margin-top:var(--space-sm)">Set cash, burn, and MRR in Settings or ask the agent to track runway.</p>'}
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Active goals</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${w}</ul>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tasks open</dt><dd>${o.tasks_open||0}</dd></div>
            <div class="spec-cell"><dt>LLM today</dt><dd class="small">${d.llm_calls||0}</dd></div>
          </dl>
        </section>
      </div>`}e.renderUpNext=S,e.handleNudgeAction=k,e.chartPanelNote=b,e.drawDashboardCharts=s,e.renderOperatorPanel=g,e.openOperatorAction=c,e.renderDashboard=m}function we(e){function S(){return localStorage.getItem("fos_chat_session")||""}function k(C){C?localStorage.setItem("fos_chat_session",C):localStorage.removeItem("fos_chat_session")}function b(C){C?.session_id&&e.setChatSessionId(C.session_id)}async function s(){let C=e.chatSessionId();if(C)try{let i=await e.api(`/history/sessions/${C}`);i?.messages?.length&&(e.chatHistory=i.messages.map(u=>({role:u.role==="assistant"?"agent":u.role,text:u.content})),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)))}catch{}}function g(C={}){let i={world_id:e.currentWorldId(),rag_mode:e.currentRagMode(),session_id:e.chatSessionId()||void 0,specialist:e.currentSpecialistId()||void 0,...C},u=(e.state._chatAttachments||[]).filter(_=>_?.doc_id);return u.length&&(i.attachments=u.map(_=>({type:"vault",doc_id:_.doc_id,title:_.title,path:_.path}))),i}function c(C){if(C.pending)return`<div class="msg-pending"><span class="live-pulse" aria-hidden="true"></span> ${e.esc(C.pendingLabel||"Agent working\u2026")}</div>`;let i=C.text||"";if(C.role==="agent"||C.role==="assistant"){let u=window.FOSMarkdown?.render?.(i)||e.esc(i),_=(C.artifacts||[]).map(I=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${I.id}">${e.esc(I.title||I.kind||"Document")}</button>`).join("");return`<div class="msg-md">${u}</div>${_?`<div class="msg-artifacts">${_}</div>`:""}`}return`<div class="msg-plain">${e.esc(i)}</div>`}function m(C,i){return`msg:${C}:${e.chatSessionId()||"default"}:${i}`}function o(C){return C<=0?e.MSG_READ_INITIAL_LINES:C===1?e.MSG_READ_INITIAL_LINES+e.MSG_READ_EXPAND_LINES:1/0}function t(C){let i=C||document.getElementById("content");i&&(e.state._msgExpand||(e.state._msgExpand={}),i.querySelectorAll(".msg-read-more-host").forEach(u=>{let _=u.querySelector(":scope > .msg-md, :scope > .msg-plain"),I=u.querySelector(".msg-read-more");if(!_||!I)return;let T=u.dataset.msgScope||"chat",F=u.dataset.msgIndex??"0",U=e.msgExpandKey(T,F),z=e.state._msgExpand[U]||0,ee=parseFloat(getComputedStyle(_).lineHeight)||21,Z=Math.max(1,Math.round(_.scrollHeight/ee)),te=e.msgReadLineLimit(z);if(I.dataset.msgReadMore=U,te>=Z||z>=2){_.classList.remove("msg-body--clamped"),_.style.maxHeight="",I.hidden=!0;return}_.classList.add("msg-body--clamped"),_.style.maxHeight=`${te*ee}px`,I.hidden=!1,I.textContent="Read more"}))}function a(C){return C?.length?`<div class="msg-artifacts">${C.map(i=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${i.id}">${e.esc(i.title||i.kind||"File")}</button>`).join("")}</div>`:""}async function d(){let C=e.currentWorldId(),i=C&&C!=="root"?`?world_id=${encodeURIComponent(C)}`:"";try{let u=await e.api(`/history${i}`,{timeoutMs:15e3});e.state._chatSessions=u.sessions||[]}catch{e.state._chatSessions=e.state._chatSessions||[]}}function r(){let C=e.state._chatSessions||[],i=e.chatSessionId();return`<section class="chat-sessions-strip driver-card">
      <div class="chat-sessions-strip__head">
        <p class="caption-uppercase">Chats</p>
        <button type="button" class="button-primary button-sm" data-new-chat-session>+ New</button>
      </div>
      <div class="chat-sessions-strip__list">${C.map(_=>`
      <button type="button" class="chat-session-chip${_.id===i?" is-active":""}" data-chat-session="${e.esc(_.id)}">
        <span class="chat-session-chip__title">${e.esc(_.title||"Conversation")}</span>
        <span class="chat-session-chip__meta">${e.fmtHistoryTime(_.updated_at)}</span>
      </button>`).join("")||"<span class='muted body-md'>No previous chats</span>"}</div>
    </section>`}async function f(C){e.openDocumentsWorkspace(C)}function R(){let C=e.state._chatAttachments||[];return C.length?`<div class="chat-attachments">${C.map((i,u)=>`<span class="chat-attachment-chip">
        <span>\u{1F4CE} ${e.esc(i.title||"File")}</span>
        <button type="button" class="chat-attachment-chip__remove" data-remove-attachment="${u}" aria-label="Remove attachment">\xD7</button>
      </span>`).join("")}</div>`:""}async function A(){let C=e.currentWorldId();if(!C||C==="root"){alert("Select a project world (not Main) to attach vault documents.");return}await e.ensureVaultForWorld(C);let i=e.vaultPayload()||{},u=i.facets||i.folders||[],_=[];for(let F of u)for(let U of F.documents||[])e.isMarkdownFilename(U.filename||U.github_path)&&_.push(U);let I=e.$("#vault-picker-list"),T=e.$("#vault-picker-dialog");!I||!T||(I.innerHTML=_.length?_.map(F=>`
      <button type="button" class="vault-picker-item" data-pick-vault-doc="${F.id}" data-world-id="${e.esc(C)}" data-doc-title="${e.esc(F.title)}" data-doc-path="${e.esc(F.github_path||F.filename||"")}">
        <strong>${e.esc(F.title)}</strong>
        <span class="muted">${e.esc(F.github_path||F.filename||"")}</span>
      </button>`).join(""):"<p class='body-md muted'>No markdown docs in vault \u2014 link and sync a GitHub repo in Worlds.</p>",T.showModal())}async function y(C){for(;;){let i=await e.api(`/chat/jobs/${encodeURIComponent(C)}`,{timeoutMs:2e4}),u=i.job;if(!u)break;if(e.state._activeJob=u,e.patchLiveUI(e.state.live),e.patchChatJobBubble(u),["completed","failed","cancelled"].includes(u.status))return{job:u,pending_approvals:i.pending_approvals};await e.sleep(1200)}return null}function w(C){let i=e.chatHistory.findIndex(_=>_.jobId===C.id);if(i<0)return;C.status==="running"?(e.chatHistory[i].pending=!0,e.chatHistory[i].pendingLabel=C.phase||"Agent working\u2026"):(e.chatHistory[i].pending=!1,e.chatHistory[i].text=C.result||C.error||"(no response)",e.chatHistory[i].artifacts=C.artifacts||[],C.session_id&&e.setChatSessionId(C.session_id));let u=e.$("#chat-messages");u&&e.currentView==="chat"&&(u.innerHTML=e.renderChatMessagesInner(),window.FOSMarkdown?.enhance?.(u),e.initMsgReadMore(u),u.scrollTop=u.scrollHeight),e.updateLiveStrip({active:C.status==="running",phase:C.phase}),e.$$("#chat-live-panel-phase, [id$='-phase']").forEach(_=>{_&&(_.textContent=C.phase||"Idle")})}function O(){return e.chatHistory.length?e.chatHistory.map((i,u)=>i.pending?`<div class="msg ${i.role} is-pending"><div class="msg-bubble">${e.renderMessageHtml(i)}</div></div>`:`<div class="msg ${i.role}">
        <div class="msg-bubble msg-read-more-host" data-msg-scope="chat" data-msg-index="${u}">
          ${e.renderMessageHtml(i)}
          <button type="button" class="msg-read-more" hidden>Read more</button>
        </div>
      </div>`).join(""):""}async function D(C,{direct:i=!1,specId:u=""}={}){let _=e.chatPayload({message:C});i&&u&&(_.specialist=u);let I=await e.api("/chat/async",{method:"POST",body:JSON.stringify(_),timeoutMs:2e4});e.state._chatAttachments=[];let T=I.job;e.chatHistory.push({role:"agent",text:"",pending:!0,jobId:T.id,pendingLabel:T.phase||"Starting\u2026"}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.state._activeJob=T,e.render(),e.startLivePoll();try{let F=await e.pollAgentJob(T.id);F?.job?.session_id&&e.setChatSessionId(F.job.session_id),F?.pending_approvals&&(e.state.approvals=F.pending_approvals,e.updateBadges()),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.loadChatSessionsList()}finally{e.state._activeJob=null,e.pollLive(),e.currentView==="chat"&&e.render()}}async function G(C){let i=C||e.state._activeJob?.id;if(i)try{await e.api(`/chat/jobs/${encodeURIComponent(i)}/cancel`,{method:"POST",timeoutMs:1e4}),e.state._activeJob?.id===i?await e.pollAgentJob(i):e.pollLive()}catch(u){alert(u.message)}}function q(){let C=e.state._agents||{},i=e.routingMeta(C),u=e.routingLabel(C),_=e.isDirectSpecialist(),I=e.listSpecialists(C),T=e.state.ragMode||"auto",F=e.RAG_MODES.find(h=>h.id===T)||e.RAG_MODES[0],U=e.renderChatMessagesInner(),z=e.state.live||{},ee=!e.chatHistory.length,Z=!!e.state._activeJob?.active||e.chatHistory.some(h=>h.pending),te=e.collectAgentRuns().slice(0,4);return`<div class="chat-shell">
      <header class="chat-header driver-card">
        <div>
          <p class="section-eyebrow">Optional \xB7 agent assist</p>
          <h2 class="title-md">Ask agent</h2>
        </div>
        <div class="chat-header__meta">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          <span class="badge-pill agent-routing-badge">${e.esc(u)}</span>
          ${Z?'<span class="badge-pill badge-pill--alert">Working</span>':""}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents">Change specialist</button>
        </div>
      </header>
      ${e.renderChatSessionsList()}
      <div class="chat-layout chat-layout--rich">
        <div class="chat-wrap">
          <div class="chat-messages${ee?" is-empty":""}" id="chat-messages">
            ${ee?`<div class="chat-empty">
              <p class="title-md">Supervisor ready</p>
              <p class="body-md">Routing: <strong>${e.esc(u)}</strong> \xB7 Retrieval: <strong>${e.esc(F.label)}</strong></p>
              <div class="capability-strip chat-empty__chips">
                <button type="button" class="delegate-hint" data-goto="crm">CRM</button>
                <button type="button" class="delegate-hint" data-goto="goals">Goals</button>
                <button type="button" class="delegate-hint" data-goto="world">Vault / Worlds</button>
                <button type="button" class="delegate-hint" data-goto="documents">Documents</button>
                <button type="button" class="delegate-hint" data-goto="agents">Agents</button>
              </div>
            </div>`:U}
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
              <textarea class="text-input-on-dark chat-input" id="chat-input" placeholder="${_?`Task for ${e.esc(i.label)}\u2026`:"Message supervisor\u2026"}" rows="3"${Z?" disabled":""}></textarea>
              <button class="button-primary" id="chat-send"${Z?" disabled":""}>${_?`Run ${e.esc(i.label)}`:"Send"}</button>
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
          ${e.renderLivePanel(z,"chat-live-panel")}
          <section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Specialists</p>
            <div class="specialist-chips" style="margin-top:var(--space-xxs)">${I.map(h=>`<span class="specialist-chip${e.currentSpecialistId()===h.id?" is-selected":""}${e.agentBusy(z,h.id)?" is-busy":""}">${e.esc(h.label)}</span>`).join("")}</div>
          </section>
          ${te.length?`<section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Recent runs</p>
            <div class="activity-timeline">${te.map(h=>`<div class="activity-timeline__row"><span>${e.esc((h.agent||"").toUpperCase())}</span><span class="muted">${e.esc((h.task||"").slice(0,40))}</span></div>`).join("")}</div>
          </section>`:""}
        </aside>
      </div>
    </div>`}function K(){requestAnimationFrame(()=>{let C=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),i=C?.[C.length-1];FOSMotion?.animateNewMessage?.(i)})}async function Q(){try{await e.api("/auth/logout",{method:"POST",body:"{}"})}catch{}e.showPinGate()}async function ae(){let C=e.$("#chat-input"),i=(C?.value||"").trim();if(!i||e.chatHistory.some(U=>U.pending))return;let u=e.currentSpecialistId(),_=e.routingMeta(e.state._agents||{}),I=!!u;C.value="",e.chatHistory.push({role:"user",text:i}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render(),e.animateLatestChatMessage();let T=e.$("#chat-send"),F=I?`Run ${_.label}`:"Send";T&&(T.disabled=!0,T.textContent="\u2026");try{await e.startAgentJob(i,{direct:I,specId:u})}catch(U){e.chatHistory.push({role:"system",text:"Error: "+U.message}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render()}T&&(T.disabled=!1,T.textContent=F),e.animateLatestChatMessage()}async function J(){let C=!e.state.config?.agent_paused;await e.api("/agent/pause",{method:"POST",body:JSON.stringify({paused:C})}),await e.refresh(),e.render()}e.chatSessionId=S,e.setChatSessionId=k,e.applyChatSessionResponse=b,e.loadChatFromServer=s,e.chatPayload=g,e.renderMessageHtml=c,e.msgExpandKey=m,e.msgReadLineLimit=o,e.initMsgReadMore=t,e.renderArtifactLinks=a,e.loadChatSessionsList=d,e.renderChatSessionsList=r,e.openMdEditor=f,e.renderChatAttachmentChips=R,e.openVaultAttachPicker=A,e.pollAgentJob=y,e.patchChatJobBubble=w,e.renderChatMessagesInner=O,e.startAgentJob=D,e.cancelActiveJob=G,e.renderChat=q,e.animateLatestChatMessage=K,e.logoutPin=Q,e.sendChat=ae,e.togglePause=J}function _e(e){function S(t){t!=null&&(e.state._documentsSelectedId=Number(t)),e.goView("documents")}function k(){let t=e.state._artifacts||[],a=e.state._documentsSelectedId,d=t.find(y=>y.id===a),r=e.state._documentDraft??"",f=e.documentsEditMode,R=t.length?t.map(y=>`
      <button type="button" class="docs-list-item${y.id===a?" is-active":""}" data-select-document="${y.id}">
        <span class="badge-pill">${e.esc(y.kind||"md")}</span>
        <span class="docs-list-item__title">${e.esc(y.title||"Untitled")}</span>
        <span class="docs-list-item__meta muted">${e.fmtHistoryTime(y.created_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No documents yet. Create one or upload a file.</p>",A=`<div class="docs-empty">
      <p class="title-sm">Document workspace</p>
      <p class="body-md muted">Select a document from the list, or create a new markdown file.</p>
      <button type="button" class="button-primary button-sm" data-docs-action="new">+ New document</button>
    </div>`;return d&&(A=`
        <div class="docs-editor__toolbar">
          <input type="text" class="text-input-on-dark docs-title-input" id="docs-title-input" value="${e.esc(d.title||"Untitled")}" aria-label="Document title">
          <select class="text-input-on-dark field-select docs-world-select" id="docs-world-select" aria-label="Project">
            ${e.renderWorldOptionsForDocs(d.world_id||"root")}
          </select>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="toggle">${f?"Preview":"Edit"}</button>
          <button type="button" class="button-primary button-sm" data-docs-action="save">Save</button>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="memory">Save to memory</button>
        </div>
        <div class="docs-editor__body">
          ${f?`<textarea id="docs-source" class="docs-source text-input-on-dark" aria-label="Document source">${e.esc(r)}</textarea>`:'<div id="docs-preview" class="md-content msg-md docs-preview"></div>'}
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
        <section class="driver-card docs-editor-panel">${A}</section>
      </div>`}async function b(){let t=prompt("Document title","Untitled");if(!t)return;let a=e.currentWorldId(),d=await e.api("/artifacts",{method:"POST",body:JSON.stringify({title:t,content:`# ${t}

`,world_id:a&&a!=="root"?a:null}),timeoutMs:15e3});e.state._documentsSelectedId=d.artifact?.id,e.documentsEditMode=!0,await e.loadViewData("documents"),e.render()}async function s(t){if(!t)return;let a=new FormData;a.append("file",t);let d=e.currentWorldId();d&&d!=="root"&&a.append("world_id",d);let r=await e.apiUpload("/artifacts",a);e.state._documentsSelectedId=r.artifact?.id,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function g(){let t=e.state._documentsSelectedId;if(!t)return;let a=document.getElementById("docs-source")?.value??e.state._documentDraft??"",d=document.getElementById("docs-title-input")?.value??"Untitled",r=document.getElementById("docs-world-select")?.value??"root";await e.api(`/artifacts/${t}/content`,{method:"PUT",body:JSON.stringify({content:a}),timeoutMs:15e3}),await e.api(`/artifacts/${t}`,{method:"PATCH",body:JSON.stringify({title:d,world_id:r==="root"?null:r}),timeoutMs:15e3}),e.state._documentDraft=a,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function c(){let t=e.state._documentsSelectedId;if(!t)return;e.documentsEditMode&&await e.saveCurrentDocument();let a=await e.api(`/artifacts/${t}/memory`,{method:"POST",body:"{}",timeoutMs:2e4});alert(`Saved to memory (${a.collection||"documents"}).`)}async function m(t){e.state._documentsSelectedId=Number(t),e.documentsEditMode=!1;try{let a=await e.api(`/artifacts/${t}/content`,{timeoutMs:15e3});e.state._documentDraft=a.content||""}catch(a){e.state._documentDraft="",alert(a.message||"Could not load document")}e.render()}function o(t){let a=(t||"").toLowerCase();return a.endsWith(".md")||a.endsWith(".markdown")||a.endsWith(".rst")}e.openDocumentsWorkspace=S,e.renderDocuments=k,e.createNewDocument=b,e.uploadDocumentFile=s,e.saveCurrentDocument=g,e.saveDocumentToMemory=c,e.selectDocument=m,e.isMarkdownFilename=o}function $e(e){function S(i){let u=i?.supervisor||{};return{id:"supervisor",label:"Supervisor",role:"aggregator",tool_count:i?.total_tools,brief:u.role||"Orchestrates specialists \u2014 picks who to run when routing is Auto"}}function k(i){let u=i?.specialists||[];return(u.length?u:e.DEFAULT_SPECIALISTS).map(I=>({...I,label:I.label||I.id}))}function b(){let i=e.listSpecialists(e.state._agents||{}),u=e.state.selectedSpecialist??"";u&&!i.some(U=>U.id===u)&&(u=""),e.state.selectedSpecialist=u;let I=`<option value="">Auto \u2014 supervisor decides</option>${i.map(U=>`<option value="${e.esc(U.id)}">${e.esc(U.label)}</option>`).join("")}`,T=e.$("#specialist-select-agents");T&&(T.innerHTML=I,T.value=u);let F=e.$("#chat-specialist-select");F&&(F.innerHTML=I,F.value=u)}function s(i){let u=e.currentSpecialistId();return u?`Supervisor \u2192 ${e.listSpecialists(i||e.state._agents||{}).find(I=>I.id===u)?.label||u}`:"Supervisor \xB7 auto-route"}function g(i){let u=e.state._agents||i||{},_=e.currentSpecialistId();return _?e.listSpecialists(u).find(I=>I.id===_)||{id:_,label:_,role:"specialist"}:e.supervisorMeta(u)}function c(i,u){let _=i?.jobs||[],I=String(u||"");if(_.some(F=>F.status==="running"&&(F.specialist===I||I==="supervisor"&&F.mode==="chat")))return!0;let T=i?.active?String(i.actor||""):"";return I==="supervisor"?T==="user":T===`subagent:${I}`||I&&T.includes(I)}function m(i){let u=e.AGENT_ROLES[i]||{label:i||"Specialist",cls:""};return`<span class="agent-role-badge ${u.cls}">${e.esc(u.label)}</span>`}function o(i,u){let _=e.AGENT_ROLES[u]||e.AGENT_ROLES.aggregator,I=e.AGENT_INITIALS[i]||(i||"??").slice(0,2).toUpperCase();return`<span class="agent-avatar ${_.avatar||"agent-avatar--aggregator"}" aria-hidden="true">${e.esc(I)}</span>`}function t(i,u){let _=(u||[]).find(T=>T.agent===i);return _?.ts?new Date(typeof _.ts=="number"&&_.ts<1e12?_.ts*1e3:_.ts).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function a(){let i=e.state._agentRunsApi||[],_=[...e.readJsonStorage("fos_agent_runs",[])];for(let I of i)_.some(T=>T.id===I.id)||_.push({...I,source:"trace"});return _.sort((I,T)=>(T.ts||0)-(I.ts||0)),_.slice(0,50)}function d(i){let u=e.readJsonStorage("fos_agent_runs",[]);u.unshift(i),localStorage.setItem("fos_agent_runs",JSON.stringify(u.slice(0,50)))}function r(i){let u=!e.currentSpecialistId();return`<button type="button" class="fleet-card fleet-card--auto${u?" is-selected":""}" data-select-specialist="" aria-pressed="${u}">
      ${u?'<span class="fleet-card__active-label">Routing</span>':""}
      <div class="fleet-card__top">
        <span class="agent-avatar agent-avatar--aggregator" aria-hidden="true">AU</span>
        <span class="fleet-card__status" title="Supervisor routes"></span>
      </div>
      <div class="fleet-card__name">Auto</div>
      <span class="agent-role-badge agent-role--aggregator">Supervisor picks</span>
      <div class="fleet-card__meta"><span>Default routing</span></div>
    </button>`}function f(i,u){let _=e.supervisorMeta(i),I=e.agentBusy(u,"supervisor");return`<div class="supervisor-banner driver-card">
      <div class="agent-card-title-row">
        ${e.agentAvatar("supervisor",_.role)}
        <div>
          <h2 class="title-md">${e.esc(_.label)} <span class="supervisor-main-tag">Main agent</span></h2>
          <p class="world-meta">${e.esc((_.brief||"").slice(0,140))}</p>
        </div>
      </div>
      <span class="agent-status ${I?"busy":"ready"}">${I?"Working":"Always on"}</span>
    </div>`}function R(i,u,_,I){let T=e.agentBusy(u,i.id),F=_===i.id,U=e.lastRunForAgent(i.id,I);return`<button type="button" class="fleet-card${T?" is-busy":""}${F?" is-selected":""}" data-select-specialist="${e.esc(i.id)}" aria-pressed="${F}">
      ${F?'<span class="fleet-card__active-label">Direct</span>':""}
      <div class="fleet-card__top">
        ${e.agentAvatar(i.id,i.role)}
        <span class="fleet-card__status ${T?"is-busy":""}" title="${T?"Working":"Idle"}"></span>
      </div>
      <div class="fleet-card__name">${e.esc(i.label)}</div>
      ${i.role?e.agentRoleBadge(i.role):""}
      <p class="fleet-card__brief">${e.esc((i.brief||"").slice(0,72))}</p>
      <div class="fleet-card__meta">
        <span>${i.tool_count??"\u2014"} tools</span>
        ${U?`<span>${e.esc(U)}</span>`:""}
      </div>
    </button>`}function A(i,u,_=!1){let I=e.listSpecialists(i),T=e.currentSpecialistId(),F=e.collectAgentRuns();return _?`<div class="fleet-rail">${e.renderFleetAutoCard(u)}${I.map(U=>e.renderFleetCard(U,u,T,F)).join("")}</div>`:`<div class="agent-grid">${I.map(U=>{let z={...U,label:U.label||U.id};return`<article class="agent-card${e.agentBusy(u,U.id)?" is-busy":""}">
          <div class="agent-card-head">${e.renderFleetCardInner(z,u,F)}</div>
        </article>`}).join("")}</div>`}function y(i,u,_){let I=e.agentBusy(u,i.id),T=e.lastRunForAgent(i.id,_);return`
      <div class="agent-card-title-row">
        ${e.agentAvatar(i.id,i.role)}
        <div><h3>${e.esc(i.label)}</h3>${i.role?e.agentRoleBadge(i.role):""}</div>
      </div>
      <span class="agent-status ${I?"busy":"ready"}">${I?"Working":"Ready"}</span>
      <p class="agent-meta">${i.tool_count??0} tools${T?` \xB7 ${e.esc(T)}`:""}</p>`}function w(i){return i.length?`<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Time</th><th>Agent</th><th>Task</th><th>Duration</th><th>Tools</th><th></th></tr></thead>
      <tbody>${i.map(u=>{let _=u.ts?e.fmtTime(u.ts):"\u2014",I=(u.tools||[]).slice(0,4).join(", "),T=e.state.expandedRunId===u.id;return`<tr class="data-row${T?" is-expanded":""}" data-run-id="${e.esc(u.id)}">
          <td class="mono muted">${e.esc(_)}</td>
          <td><span class="fleet-inline-badge">${e.esc((u.agent||"").toUpperCase())}</span></td>
          <td class="task-cell">${e.esc((u.task||"").slice(0,120))}</td>
          <td class="mono">${u.duration_s?`${u.duration_s}s`:"\u2014"}</td>
          <td class="muted">${e.esc(I||"\u2014")}</td>
          <td><button type="button" class="button-tertiary-text button-sm" data-toggle-run="${e.esc(u.id)}">${T?"Hide":"View"}</button></td>
        </tr>
        ${T?`<tr class="data-row-detail"><td colspan="6"><pre class="run-result mono">${e.esc(u.result||"No output recorded")}</pre></td></tr>`:""}`}).join("")}</tbody>
    </table></div>`:'<div class="empty-state"><p class="title-sm">No specialist runs yet</p></div>'}function O(){let i=e.state._tools||{},u=i.by_category||{};return`<div class="console-split">
      <div class="driver-card">${Object.entries(u).sort((I,T)=>T[1]-I[1]).map(([I,T])=>`<div class="kv-row"><span class="k">${e.esc(I)}</span><span class="v">${T}</span></div>`).join("")||"<p class='muted'>No tools loaded</p>"}</div>
      <div class="driver-card tool-list-compact">${(i.tools||[]).slice(0,24).map(I=>`<div class="tool-chip">${e.esc(I.name)}${I.requires_approval?'<span class="badge-pill">approval</span>':""}</div>`).join("")}</div>
    </div>`}function D(){let i=e.state._crm||{},u=i.pipeline||{},_=i.contacts||[],I=i.followups_due||[],T=Object.entries(u).map(([z,ee])=>`<div class="kv-row"><span class="k">${e.esc(z)}</span><span class="v">${ee}</span></div>`).join(""),F=I.slice(0,8).map(z=>`<li>${e.esc(z.name)} <span class="muted">${e.esc(z.company||"")}</span></li>`).join("")||"<li class='muted'>None due</li>",U=_.slice(0,10).map(z=>`<tr><td>${e.esc(z.name)}</td><td>${e.esc(z.company||"\u2014")}</td><td>${e.esc(z.status||"\u2014")}</td></tr>`).join("");return`<div class="console-split">
      <section class="driver-card"><p class="caption-uppercase">Pipeline</p>${T||"<p class='muted'>Empty</p>"}
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Follow-ups due</p><ul class="list-plain">${F}</ul></section>
      <section class="driver-card"><p class="caption-uppercase">Contacts (${_.length})</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Company</th><th>Status</th></tr></thead>
        <tbody>${U||"<tr><td colspan='3' class='muted'>No contacts</td></tr>"}</tbody></table></div>
        <button type="button" class="button-outline-on-dark button-sm" data-goto="crm" style="margin-top:var(--space-xs)">Open CRM</button>
      </section>
    </div>`}function G(){let i=e.currentWorldId(),u=e.vaultReadyFor(i)?e.vaultPayload()||{}:{},_=u.folders||u.facets||[],I=e.state._agentsVaultQ||"",T=i!=="root"&&!e.vaultReadyFor(i);return`<div class="console-split">
      <section class="driver-card">
        <p class="caption-uppercase">Vault \xB7 ${e.esc(e.activeWorldLabel())}</p>
        ${T?"<p class='body-md muted' style='margin-top:var(--space-xs)'>Loading vault registry\u2026</p>":`<div class="vault-facet-grid" style="margin-top:var(--space-xs)">${_.map(F=>`<div class="vault-facet-card"><div class="vault-facet-head"><h4>${e.esc(F.domain_label||F.label||F.folder||"")}</h4><span class="badge-pill">${F.file_count??0} files</span></div></div>`).join("")||"<p class='muted'>Select a sub-world or link a repo in Worlds</p>"}</div>`}
        <button type="button" class="button-outline-on-dark button-sm" data-goto="world" style="margin-top:var(--space-sm)">Manage vault</button>
      </section>
      <section class="driver-card">
        <div class="search-row">
          <input type="search" class="text-input-on-dark" id="agents-vault-q" placeholder="Search vault\u2026" value="${e.esc(I)}">
          <button type="button" class="button-primary button-sm" id="agents-vault-search">Search</button>
        </div>
        <pre class="run-result mono" id="agents-vault-results" hidden></pre>
      </section>
    </div>`}function q(){let i=e.state.agentsTab||"runs",u=e.collectAgentRuns();if(i==="runs")return e.renderAgentRunsTable(u);if(i==="live"){let _=e.state.live||{};return e.renderLivePanel(_,"agents-tab-live")}return i==="tools"?e.renderAgentsToolsPanel():i==="crm"?e.renderAgentsCrmPanel():i==="vault"?e.renderAgentsVaultPanel():""}function K(){let i=e.state._agents||{},u=e.state.live||i.live||{},_=e.routingMeta(i),I=e.routingLabel(i),T=e.isDirectSpecialist(),F=e.state._delegateDraft||"",U=e.collectAgentRuns(),z=(e.state.approvals||[]).length,ee=(i.specialists||[]).filter(P=>e.agentBusy(u,P.id)).length,Z=i.skills||[],te=e.state.agentsTab||"runs",h=!!(e.state._delegateResult||"").trim(),$=e.state._agentActions||[];return`<div class="agents-console">
      <header class="console-toolbar driver-card">
        <div class="console-kpis">
          <div class="console-kpi"><span class="console-kpi__val">${i.specialists?.length||5}</span><span class="console-kpi__lbl">Specialists</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${ee||"0"}</span><span class="console-kpi__lbl">Active</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${U.length}</span><span class="console-kpi__lbl">Runs</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${i.total_tools||0}</span><span class="console-kpi__lbl">Tools</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${z}</span><span class="console-kpi__lbl">Approvals</span></div>
        </div>
        <div class="console-toolbar__actions">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          ${Z.map(P=>`<span class="skill-chip${P.installed?"":" is-missing"}">${e.esc(P.name)}</span>`).join("")}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="approvals"${z?"":" disabled"}>Approvals${z?` (${z})`:""}</button>
        </div>
      </header>
  
      ${e.renderSupervisorBanner(i,u)}
  
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
          <span class="badge-pill agent-routing-badge">${e.esc(I)}</span>
        </div>
        <div class="agent-picker-bar__cards">${e.renderAgentCards(i,u,!0)}</div>
      </section>
  
      <div class="agents-workspace">
        <section class="task-composer driver-card">
          <div class="task-composer__head">
            <div class="agent-card-title-row">
              ${e.agentAvatar(T?_.id:"supervisor",T?_.role:"aggregator")}
              <div>
                <h2 class="title-md">${T?e.esc(_.label):"Supervisor"}</h2>
                <p class="world-meta">${T?e.esc((_.brief||"").slice(0,100)):"Auto-route \u2014 supervisor will delegate to the best specialist"}</p>
              </div>
            </div>
            <span class="agent-status ${e.agentBusy(u,T?_.id:"supervisor")?"busy":"ready"}">${e.esc(I)}</span>
          </div>
          <textarea class="text-input-on-dark task-composer__input" id="delegate-selected" rows="3" placeholder="${T?`Task for ${e.esc(_.label)}\u2026`:"Message supervisor\u2026"}">${e.esc(F)}</textarea>
          <div class="task-composer__foot">
            <button type="button" class="button-primary" id="delegate-selected-btn">${T?`Run ${e.esc(_.label)}`:"Send to supervisor"}</button>
            <span class="world-meta mono" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          </div>
          ${h?`<div class="delegate-result-wrap msg-read-more-host driver-card" data-msg-scope="agents-delegate" data-msg-index="0">
            <div class="msg-md delegate-result-body">${window.FOSMarkdown?.render?.(e.state._delegateResult||"")||e.esc(e.state._delegateResult||"")}</div>
            <button type="button" class="msg-read-more" hidden>Read more</button>
          </div>`:""}
          <section class="driver-card chat-runtime-panel agents-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-agents" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </section>
  
        <aside class="agents-rail driver-card">
          ${e.renderLivePanel(u,"agents-live-panel")}
          <p class="caption-uppercase" style="margin-top:var(--space-sm)">Recent actions</p>
          <div class="action-feed">${$.slice(0,8).map(P=>`<div class="action-feed__item"><span class="mono">${e.esc(P.tool_name)}</span><span class="muted">${e.esc((P.created_at||"").slice(11,16))}</span></div>`).join("")||"<p class='muted'>No actions yet</p>"}</div>
        </aside>
      </div>
  
      <section class="driver-card agents-panel">
        <div class="workspace-tabs">
          <button type="button" class="workspace-tab${te==="runs"?" is-active":""}" data-agents-tab="runs">Run history</button>
          <button type="button" class="workspace-tab${te==="live"?" is-active":""}" data-agents-tab="live">Live runtime</button>
          <button type="button" class="workspace-tab${te==="tools"?" is-active":""}" data-agents-tab="tools">Tools</button>
          <button type="button" class="workspace-tab${te==="crm"?" is-active":""}" data-agents-tab="crm">CRM</button>
          <button type="button" class="workspace-tab${te==="vault"?" is-active":""}" data-agents-tab="vault">Vault</button>
        </div>
        <div class="agents-tab-body">${e.renderAgentsTabPanel()}</div>
      </section>
    </div>`}function Q(){if(e.currentView!=="agents"||e.state.agentsTab!=="vault")return;let i=document.querySelector(".agents-console .console-split");i&&(i.outerHTML=e.renderAgentsVaultPanel())}function ae(i){let u=i||"";e.state.selectedSpecialist=u,localStorage.setItem("fos_selected_specialist",u),e.populateSpecialistSelect(),e.render()}async function J(){let i=e.$("#agents-vault-q")?.value?.trim();e.state._agentsVaultQ=i;let u=e.$("#agents-vault-results"),_=e.currentWorldId();if(!(!i||!_||_==="root"))try{let T=((await e.api(`/vault/search?${new URLSearchParams({q:i,world_id:_})}`)).hits||[]).map(F=>`[${F.metadata?.domain||"?"}] ${F.metadata?.source||""}
${(F.text||"").slice(0,240)}`).join(`

---

`)||"No hits.";u&&(u.textContent=T,u.hidden=!1)}catch(I){u&&(u.textContent=I.message,u.hidden=!1)}}async function C(){let i=e.currentSpecialistId(),u=e.$("#delegate-selected"),_=(u?.value||"").trim();if(!_)return;let I=e.$("#delegate-selected-btn"),T=e.routingMeta(e.state._agents||{}),F=!!i,U=Date.now();I&&(I.disabled=!0,I.textContent="Running\u2026"),e.startLivePoll(),e.state.agentsTab="live",localStorage.setItem("fos_agents_tab","live"),e.state._delegateResult="Agent working\u2026",e.render();try{let z=await e.api("/chat/async",{method:"POST",body:JSON.stringify(e.chatPayload({message:_,specialist:F?i:void 0})),timeoutMs:2e4}),ee=await e.pollAgentJob(z.job.id),Z=ee?.job,te=Z?.result||Z?.error||"(no response)";e.state._delegateResult=te,e.state._delegateDraft="",u&&(u.value=""),Z?.session_id&&e.setChatSessionId(Z.session_id),e.persistAgentRun({id:Z?.run_id||`local-${U}`,agent:F?i:"supervisor",task:_,result:te,duration_s:Z?.elapsed_s||Math.round((Date.now()-U)/1e3),ts:Math.floor(U/1e3),tools:(Z?.events||[]).filter(h=>h.name).map(h=>h.name),source:"delegate",artifacts:Z?.artifacts}),e.state.agentsTab="runs",localStorage.setItem("fos_agents_tab","runs"),e.state.expandedRunId=Z?.run_id||`local-${U}`,ee?.pending_approvals&&(e.state.approvals=ee.pending_approvals,e.updateBadges())}catch(z){e.state._delegateResult="Error: "+z.message}I&&(I.disabled=!1,I.textContent=F?`Run ${T.label}`:"Send to supervisor");try{let z=await e.api("/agents/runs");e.state._agentRunsApi=z.runs||[],e.state._agentActions=z.actions||[]}catch{}e.state._activeJob=null,e.pollLive(),e.render(),e.drawGraphs()}e.supervisorMeta=S,e.listSpecialists=k,e.populateSpecialistSelect=b,e.routingLabel=s,e.routingMeta=g,e.agentBusy=c,e.agentRoleBadge=m,e.agentAvatar=o,e.lastRunForAgent=t,e.collectAgentRuns=a,e.persistAgentRun=d,e.renderFleetAutoCard=r,e.renderSupervisorBanner=f,e.renderFleetCard=R,e.renderAgentCards=A,e.renderFleetCardInner=y,e.renderAgentRunsTable=w,e.renderAgentsToolsPanel=O,e.renderAgentsCrmPanel=D,e.renderAgentsVaultPanel=G,e.renderAgentsTabPanel=q,e.renderAgents=K,e.patchAgentsVaultPanel=Q,e.selectSpecialist=ae,e.agentsVaultSearch=J,e.delegateAgent=C}function Se(e){function S(n){let l=e.state.worlds||e.state._worldFull?.worlds||{},p=l.root,v=l.children||[],L=n||"",V=`<option value="root"${L==="root"||!L?" selected":""}>${e.esc(p?.name||"Main world")}</option>`;return V+=v.map(N=>`<option value="${e.esc(N.id)}"${L===N.id?" selected":""}>${e.esc(N.name)} \xB7 ${e.esc(N.kind||"project")}</option>`).join(""),V}function k(n,l){let p=n?.facets||n?.folders||[],v=[];for(let L of p)for(let V of L.documents||[])V.github_repo===l&&v.push(V);return v.sort((L,V)=>(L.github_path||L.filename||"").localeCompare(V.github_path||V.filename||""))}function b(n){let l=n.filter(p=>{let v=p.github_path||p.filename||"";return/^readme\.md$/i.test(v.split("/").pop()||"")});return l.length?l.sort((p,v)=>(p.github_path||p.filename||"").length-(v.github_path||v.filename||"").length)[0]:null}function s(n){let l=(n.files||[]).length;for(let p of Object.keys(n.dirs||{}))l+=e.countGithubTreeFiles(n.dirs[p]);return l}function g(n,l,p=0){let v=Object.keys(n.dirs||{}).sort(),L=(n.files||[]).sort((N,B)=>N._fileName.localeCompare(B._fileName)),V="";for(let N of v){let B=n.dirs[N],Y=e.countGithubTreeFiles(B);V+=`<details class="github-tree-dir"${p<2?" open":""}>
        <summary><span class="mono">${e.esc(N)}</span> <span class="muted">${Y} file${Y!==1?"s":""}</span></summary>
        <div class="github-tree">${e.renderGithubTreeNode(B,l,p+1)}</div>
      </details>`}for(let N of L){let B=N.github_path||N.filename||N.title,Y=/^readme\.md$/i.test((B||"").split("/").pop()||"");V+=`<div class="github-tree-file">
        <span class="github-tree-file__path mono${Y?" is-readme":""}">${e.esc(B)}</span>
        <span class="github-tree-file__actions">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-view-doc="${N.id}" data-world-id="${e.esc(l)}" data-doc-title="${e.esc(N.title||B)}">View</button>
          <button type="button" class="button-primary button-sm" data-tag-vault-doc="${N.id}" data-world-id="${e.esc(l)}" data-doc-title="${e.esc(N.title||B)}" data-doc-path="${e.esc(B)}">Tag in agent</button>
        </span>
      </div>`}return V}function c(n,l,p,v){e.state._chatAttachments||(e.state._chatAttachments=[]);let L=Number(n);e.state._chatAttachments.some(V=>V.doc_id===L)||e.state._chatAttachments.push({type:"vault",doc_id:L,title:p||v||"Document",path:v||"",world_id:l}),e.goView("chat")}function m(n,l){if(n?.nodes&&n?.edges)return n;let p=n?.vault||n||{},v=l||{},L=[],V=[],N=v.id||p.world_id||"world",B=`vault-world:${N}`;return L.push({data:{id:B,label:(v.name||"World").slice(0,36),type:"world_root",world_id:N}}),(p.facets||p.folders||[]).forEach(E=>{let W=E.id||E.folder||"slot",M=`vault-facet:${N}:${W}`,x=`${E.label||E.folder||"Folder"} (${E.file_count||0})`;L.push({data:{id:M,label:x.slice(0,40),type:"vault_facet",facet_id:W,folder:E.folder}}),V.push({data:{source:B,target:M,label:"folder"}}),(E.documents||[]).slice(0,14).forEach((j,X)=>{let se=`vault-doc:${j.id||X}`;L.push({data:{id:se,label:(j.title||j.filename||"Document").slice(0,36),type:"vault_file",doc_id:j.id,facet_id:W,source:j.source_type||"upload"}}),V.push({data:{source:M,target:se,label:"doc"}})}),(E.files||[]).slice(0,8).forEach((j,X)=>{let se=`vault-disk:${N}:${W}:${X}`;L.push({data:{id:se,label:(j.name||j.relative||"file").slice(0,32),type:"vault_file",path:j.relative,facet_id:W,source:"disk"}}),V.push({data:{source:M,target:se,label:"disk"}})})}),(p.github_repos||[]).slice(0,10).forEach(E=>{let W=`gh-repo:${E.id}`;L.push({data:{id:W,label:(E.full_name||"repo").split("/").pop().slice(0,28),type:"vault_repo",link_id:E.id,repo:E.full_name}}),V.push({data:{source:B,target:W,label:"github"}})}),L.length<=1&&(L.push({data:{id:"vault-empty",label:"Add docs or link GitHub",type:"empty"}}),V.push({data:{source:B,target:"vault-empty",label:"start"}})),{nodes:L,edges:V}}function o(n){let l=n?.id;if(!l||l==="root")return{nodes:[],edges:[]};if(e.state._vaultLoading&&e.state._vaultWorldId!==l)return{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]};if(e.state._vaultWorldId===l&&e.state._vaultGraph?.nodes?.length)return e.state._vaultGraph;let p=e.vaultReadyFor(l)?e.vaultPayload():null;return p?e.buildVaultGraph(p,n):e.state._vaultLoading?{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]}:{nodes:[{data:{id:"vault-empty",label:"Vault not loaded",type:"empty"}}],edges:[]}}function t(n){return n==="vault"?`
        <span><i style="border-color:#051f13"></i> World</span>
        <span><i style="border-color:#00666b"></i> Folder</span>
        <span><i style="border-color:#8f706b;border-radius:50%"></i> File</span>
        <span><i style="border-color:#f75440;background:#2d312e"></i> GitHub</span>`:`
      <span><i style="border-color:#051f13"></i> Main</span>
      <span><i style="border-color:#f75440"></i> Project</span>
      <span><i style="border-color:#ffb4a8"></i> Idea</span>
      <span><i style="border-color:#00666b"></i> Research</span>
      <span><i style="border-color:#f75440;background:#f7544033"></i> Active</span>`}function a(n="world-create-form"){return`
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
      </form>`}function d(n){let l=e.worldTreeData(),p=n||"root";return p==="root"||p===l.root?.id?l.root||null:(l.children||[]).find(v=>v.id===p)||null}function r(){return e.state.inspectorWorldId||e.currentWorldId()||"root"}async function f(n,{force:l=!1}={}){if(!n||n==="root"){e.clearVaultScopedState(),e.invalidateGraphCache("graph-world");return}if(!l&&e.vaultReadyFor(n))return;let p=++e.vaultLoadGen;e.state._vaultLoading=!0,e.state._vaultWorldId=n,e.currentView==="world"&&e.patchWorldPanels();try{let v=await e.api(`/worlds/${encodeURIComponent(n)}/vault`);if(p!==e.vaultLoadGen)return;e.state._worldVault=v.vault||null,e.state._vaultGraph=v.vault_graph||null,e.state._vaultWorldId=n,e.invalidateGraphCache("graph-world")}catch{if(p!==e.vaultLoadGen)return;e.clearVaultScopedState()}finally{p===e.vaultLoadGen&&(e.state._vaultLoading=!1)}}async function R(n,l={}){if(!n||n==="root"){e.clearVaultScopedState();return}l.force&&(e.state._vaultWorldId=null),await e.loadWorldVault(n,{force:!0})}async function A(){try{let n=await e.api("/graph/world");e.state._worldFull=n,e.state._worldGraph=n?.graph??null,e.state._worldHierarchyGraph=n?.hierarchy_graph??null,e.state._worldPreviews=n?.world_previews??{},n?.worlds&&(e.state.worlds=n.worlds),e.populateWorldSelect(),e.invalidateGraphCache("graph-world")}catch(n){console.warn("world tree reload failed:",n)}}async function y(n,l={}){if(!n||n==="root"){e.clearVaultScopedState();return}!l.force&&e.vaultReadyFor(n)||await e.loadWorldVault(n,{force:!!l.force})}function w(){let n=e.inspectorWorldId(),l=e.state.activeWorldId||"root";e.$$("[data-inspect-world]").forEach(v=>{let L=v.dataset.inspectWorld;v.classList.toggle("is-inspect",L===n),v.classList.toggle("is-active",L===l)});let p=document.querySelector(".worlds-stat [data-active-world-label]");p&&(p.textContent=e.activeWorldLabel())}function O(){if(e.currentView!=="world")return;let n=e.inspectorWorldId(),l=e.worldById(n),p=e.state._worldFull?.snapshot||e.state.snapshot||{},v=document.getElementById("world-inspector");v&&(v.innerHTML=e.renderWorldInspector(l,p));let L=document.getElementById("world-vault-mount");if(e.isRootWorld(l))L&&(L.innerHTML="");else{let V=e.renderWorldVaultPanel(l);L&&(L.innerHTML=V)}e.patchWorldTreeNav(),e.drawGraphs()}async function D(n={}){let l=e.currentWorldId(),p=e.inspectorWorldId(),v=n.vaultWorldId||(e.currentView==="world"?p:l);!v||v==="root"?e.clearVaultScopedState():await e.ensureVaultForWorld(v,{force:!!n.forceVault}),e.currentView==="world"&&n.reloadTree?await e.reloadWorldTree():(e.currentView==="world"||e.currentView==="dashboard")&&await e.loadGraphData(),e.drawGraphs()}function G(n){let l=n||"root";e.inspectorWorldId()===l&&e.vaultReadyFor(l)&&!e.state._vaultLoading||(e.state.inspectorWorldId=l,e.currentView==="world"&&(e.state._motionSkipOnce=!0,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.patchWorldPanels(),e.reloadVault(l,{force:!0}).then(()=>{e.patchWorldPanels(),FOSMotion?.flashElement?.(e.$("#world-inspector")),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())}).catch(console.error)))}function q(n,l,p,v){let L=n?.id||"root",V=`
      <button type="button" class="world-tree-item is-root${p===L?" is-inspect":""}${v===L?" is-active":""}"
        data-inspect-world="${e.esc(L)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(n?.name||"Main world")}</span>
          <span class="sub">Top-level \xB7 all ventures</span>
        </span>
      </button>`,N=l.map(B=>`
      <button type="button" class="world-tree-item kind-${e.esc(B.kind||"project")}${p===B.id?" is-inspect":""}${v===B.id?" is-active":""}"
        data-inspect-world="${e.esc(B.id)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(B.name)}</span>
          <span class="sub">${e.esc(B.kind||"project")} \xB7 ${e.esc((B.description||"No description").slice(0,42))}</span>
        </span>
      </button>`).join("");return`
      <nav class="world-tree-nav" aria-label="World hierarchy">
        ${V}
        ${l.length?`<div class="world-tree-children">${N}</div>`:""}
      </nav>`}function K(n,l){if(!n)return'<p class="body-md muted">Select a world to inspect its context.</p>';let p=n.id||"root",v=p==="root",L=v?"root":n.kind||"project",V=e.currentWorldId(),B=(e.state._worldPreviews||e.state._worldFull?.world_previews||{})[p]||"",Y=l?.crm||{},E=l?.finance||{};if(e.state.worldEditing===p)return`
        <form class="world-edit-form" id="world-edit-form" data-world-id="${e.esc(p)}">
          <div class="world-inspector-title">
            <h2>Edit ${e.esc(n.name)}</h2>
            ${e.worldKindBadge(L)}
          </div>
          ${v?`
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
                ${(e.state._worldTemplates||[]).map(X=>`<option value="${e.esc(X.id)}"${(n.template||"")===X.id?" selected":""}>${e.esc(X.label)}</option>`).join("")||`<option value="startup"${(n.template||"startup")==="startup"?" selected":""}>Startup / venture</option>`}
              </select>
            </label>`}
          <label>Description<textarea class="text-input-on-dark" name="description" rows="2">${e.esc(n.description||"")}</textarea></label>
          <label>Agent context<textarea class="text-input-on-dark" name="context" rows="5">${e.esc(n.context||"")}</textarea></label>
          <div class="world-inspector-actions">
            <button type="submit" class="button-primary button-sm">Save</button>
            <button type="button" class="button-tertiary-text button-sm" data-cancel-edit>Cancel</button>
          </div>
        </form>`;let M=v?[["Contacts",Y.total_contacts||0],["Follow-ups",Y.followups_due||0],["Open tasks",l?.tasks_open||0],["Approvals",l?.approvals_pending||0]]:[];v&&E?.set&&M.push(["Runway",E.runway_months!=null?`${E.runway_months} mo`:"\u2014"]);let x=v?e.worldTreeData().children||[]:[],j=(l?.goals_active||[]).slice(0,5);return`
      <div class="world-inspector-title">
        <div>
          <h2>${e.esc(n.name)}</h2>
          <p class="world-meta">id: ${e.esc(p)}${n.updated_at?` \xB7 updated ${e.esc(n.updated_at)}`:""}</p>
        </div>
        ${e.worldKindBadge(L)}
      </div>
      ${V===p?'<p class="world-meta" style="color:var(--color-primary)">\u25CF Active for chat &amp; agents</p>':'<p class="world-meta">Not active \u2014 switch from the top bar or below</p>'}
      <div class="world-inspector-section">
        <h4>Description</h4>
        <p>${e.esc(n.description||"No description yet.")}</p>
      </div>
      <div class="world-inspector-section">
        <h4>Agent context</h4>
        <p>${e.esc(n.context||"No focused context \u2014 add what the agent should know in this world.")}</p>
      </div>
      ${M.length?`
        <div class="world-inspector-section">
          <h4>Global snapshot</h4>
          <div class="world-inspector-facts">${M.map(([X,se])=>`<div class="world-inspector-fact"><span class="k">${e.esc(X)}</span><span class="v">${e.esc(String(se))}</span></div>`).join("")}</div>
        </div>`:""}
      ${v&&x.length?`
        <div class="world-inspector-section">
          <h4>Sub-worlds indexed (${x.length})</h4>
          <div class="world-inspector-facts">${x.map(X=>`<div class="world-inspector-fact"><span class="k">${e.esc(X.name)}</span><span class="v">${e.esc(X.kind||"project")}</span></div>`).join("")}</div>
        </div>`:""}
      ${v?"":`
        <div class="world-inspector-section">
          <h4>Template</h4>
          <p class="body-md">${e.esc(n.template||L)} \u2014 facet folders on disk under <code class="mono">data/knowledge/</code></p>
          ${n.github_repo?`<p class="world-meta">GitHub: ${e.esc(n.github_repo)}</p>`:""}
          ${n.repo_path?`<p class="world-meta">Repo: ${e.esc(n.repo_path)}</p>`:""}
        </div>`}
      ${!v&&e.worldTreeData().root?`
        <div class="world-inspector-section">
          <h4>Parent</h4>
          <p class="body-md">${e.esc(e.worldTreeData().root.name)} <span class="world-meta">(main world)</span></p>
        </div>`:""}
      ${j.length&&v?`
        <div class="world-inspector-section">
          <h4>Active goals</h4>
          <p class="body-md">${j.map(X=>e.esc(typeof X=="string"?X:X.title||X)).join(" \xB7 ")}</p>
        </div>`:""}
      <div class="world-inspector-section">
        <h4>What the agent sees</h4>
        <pre class="world-context-preview">${e.esc(B||"Preview loads when graph data is fetched\u2026")}</pre>
      </div>
      <div class="world-inspector-actions">
        <button type="button" class="button-primary button-sm" data-use-world="${e.esc(p)}">Use in chat</button>
        <button type="button" class="button-outline-on-dark button-sm" data-set-active-world="${e.esc(p)}">Set active</button>
        <button type="button" class="button-tertiary-text button-sm" data-edit-world="${e.esc(p)}">Edit</button>
        ${v?"":`<button type="button" class="button-tertiary-text button-sm" data-delete-world="${e.esc(p)}">Delete</button>`}
      </div>`}function Q(n,l,p){let v=e.state.ui?.vaultDocEdit,L=p||l[0]?.id||l[0]?.folder||"docs",V=l.find(E=>(E.id||E.folder)===L)||l[0]||{label:L,id:L},N=v&&v.title||"",B=v&&v.description||"",Y=v?.id||"";return`
      <form class="human-form vault-doc-form" id="vault-doc-form" data-world-id="${e.esc(n.id)}" data-facet-id="${e.esc(L)}">
        ${Y?`<input type="hidden" name="doc_id" value="${Y}">`:""}
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Category slot</span>
            <select class="text-input-on-dark" name="facet_id" id="vault-doc-facet">
              ${l.map(E=>{let W=E.id||E.folder;return`<option value="${e.esc(W)}"${W===L?" selected":""}>${e.esc(E.label)}</option>`}).join("")}
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Title</span>
            <input class="text-input-on-dark" name="title" required placeholder="e.g. Current ICP" value="${e.esc(N)}"></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description (indexed for search)</span>
          <textarea class="text-input-on-dark" name="description" rows="3" placeholder="Short summary agents use to find this doc. Full content goes to ${e.esc(e.vaultStorageLabel())}.">${e.esc(B)}</textarea></label>
        ${Y?`
        <label class="human-field"><span class="caption-uppercase">Document body (markdown)</span>
          <textarea class="text-input-on-dark" name="content" id="vault-doc-content" rows="8" placeholder="Loading\u2026"></textarea></label>`:`
        <label class="human-field"><span class="caption-uppercase">Upload file</span>
          <input type="file" name="file" accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json"></label>
        <label class="human-field"><span class="caption-uppercase">Or paste markdown</span>
          <textarea class="text-input-on-dark" name="content" rows="6" placeholder="# ICP

Target: \u2026"></textarea></label>`}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm">${Y?"Update document":"Add document"}</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-cancel-doc>Cancel</button>
        </div>
        <p class="world-meta">Slot: <strong>${e.esc(V.label)}</strong> \xB7 Full files in ${e.esc(e.vaultStorageLabel())}; only title + description in vector index.</p>
      </form>`}function ae(n,l){let p=e.state._githubStatus||{},v=!!p.connected,L=!!p.oauth_configured,V=l.github_repos||[],B=(e.state._githubRepos||[]).map(E=>`<option value="${e.esc(E.full_name)}">${e.esc(E.full_name)}${E.private?" (private)":""}</option>`).join(""),Y=V.map(E=>{let W=e.isLinkSyncing(E.id),M=e.githubRepoDocuments(l,E.full_name),x=e.findReadmeDoc(M),j=M.filter(se=>e.isMarkdownFilename(se.github_path||se.filename)),X=j.length?`<div class="github-tree github-tree--repo">${e.renderGithubTreeNode(e.buildGithubPathTree(j),n.id)}</div>`:"";return`
      <div class="github-repo-row">
        <div>
          <strong class="mono">${e.esc(E.full_name)}</strong>
          ${W?'<span class="sync-badge">Syncing</span>':""}
          <span class="world-meta">${E.file_count||M.length||0} files synced${E.synced_at?` \xB7 ${e.esc(E.synced_at)}`:""}</span>
          ${E.last_error?`<span class="world-meta" style="color:var(--color-warn)">${e.esc(E.last_error)}</span>`:""}
        </div>
        <div class="github-repo-row__actions">
          <button type="button" class="button-primary button-sm" data-vault-view-doc="${x?.id||""}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(x?.title||`${E.full_name} README`)}"${!x||W?" disabled":""}>Open README</button>
          <button type="button" class="button-outline-on-dark button-sm${W?" is-busy":""}" data-github-sync="${E.id}" data-world-id="${e.esc(n.id)}"${W?" disabled":""}>${W?"Syncing\u2026":`Sync to ${e.esc(e.vaultStorageLabel())}`}</button>
          <button type="button" class="button-tertiary-text button-sm" data-github-unlink="${E.id}" data-world-id="${e.esc(n.id)}"${W?" disabled":""}>Unlink</button>
        </div>
        ${M.length?`<details class="github-repo-files" open>
          <summary class="caption-uppercase">Repo structure \xB7 ${j.length} markdown file${j.length===1?"":"s"}</summary>
          ${X||"<p class='muted body-md'>No markdown files synced yet.</p>"}
        </details>`:'<p class="body-md muted github-repo-files-empty">No files synced yet \u2014 link and sync to browse the repo tree here.</p>'}
      </div>`}).join("");return L?v?`<section class="github-repos-panel">
      <div class="github-repos-panel__head">
        <div>
          <p class="section-eyebrow">GitHub repositories</p>
          <p class="body-md muted">Connected as <strong>${e.esc(p.user?.login||"GitHub")}</strong> \u2014 link multiple repos; files sync to ${e.esc(e.vaultStorageLabel())} with searchable descriptions.</p>
        </div>
      </div>
      <div class="human-form__row" style="align-items:flex-end">
        <label class="human-field" style="flex:1">
          <span class="caption-uppercase">Add repository</span>
          <select class="text-input-on-dark" id="github-repo-pick">
            <option value="">Select a repository\u2026</option>
            ${B}
          </select>
        </label>
        <button type="button" class="button-primary button-sm" data-github-add="${e.esc(n.id)}"${e.state._syncingLinkIds.size?" disabled":""}>Link &amp; sync</button>
      </div>
      <div class="github-repo-list">${Y||"<p class='body-md muted'>No GitHub repos linked yet.</p>"}</div>
    </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub repositories</p>
        <p class="body-md muted">Authorize GitHub to browse your repos and sync docs into this world's knowledge graph (${e.esc(e.vaultStorageLabel())}).</p>
        <a class="button-primary button-sm" href="/api/github/auth/start?world_id=${encodeURIComponent(n.id)}">Connect GitHub</a>
      </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub</p>
        <p class="body-md muted">Add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to <code>.env</code>, register callback <code>${e.esc(p.redirect_uri||"/api/github/callback")}</code>, then restart.</p>
      </section>`}function J(n,l){let p=n.facets||n.folders||[],v=n.storage_backend||(e.vaultStorageLabel()==="S3"?"s3":"local");return`
      <div class="vault-registry-bar" role="status" aria-live="polite">
        <span class="vault-registry-chip"><span class="k">Template</span> ${e.esc(n.template_id||l.template||"startup")}</span>
        <span class="vault-registry-chip"><span class="k">Slots</span> ${p.length}</span>
        <span class="vault-registry-chip"><span class="k">Docs</span> ${n.document_count||0}</span>
        <span class="vault-registry-chip"><span class="k">Storage</span> ${e.esc(v)}</span>
        <button type="button" class="button-tertiary-text button-sm" data-vault-reload="${e.esc(l.id)}">Reload registry</button>
      </div>`}function C(n){if(!n||n.id==="root")return"";if(e.state._vaultLoading||e.state._vaultWorldId!==n.id)return`
      <section class="driver-card vault-panel knowledge-panel panel-loading" style="margin-top:var(--space-md)">
        <p class="section-eyebrow">Knowledge vault</p>
        <h3 class="title-sm">${e.esc(n.name)}</h3>
        <div class="skeleton-grid" style="margin-top:var(--space-sm)">
          ${e.skeletonCard(3)}${e.skeletonCard(3)}${e.skeletonCard(3)}
        </div>
      </section>`;let l=e.vaultPayload()||{},p=l.facets||l.folders||[],v=l.domain_counts||{},L=e.state.ui?.vaultFacet||p[0]?.id||p[0]?.folder||null,V=e.state.ui?.vaultDocForm||e.state.ui?.vaultDocEdit,N=(p.find(M=>(M.id||M.folder)===L)||{}).documents||[],B=p.map(M=>{let x=M.id||M.folder,j=(M.documents||[]).length+(M.files||[]).length;return`<button type="button" class="vault-facet-tab${x===L?" is-active":""}" data-vault-facet="${e.esc(x)}">${e.esc(M.label)} <span class="badge-pill">${j}</span></button>`}).join(""),Y=N.map(M=>{let x=M.github_path?` \xB7 ${M.github_path}`:"",j=e.isMarkdownFilename(M.filename||M.github_path);return`
      <article class="vault-doc-card" data-doc-id="${M.id}">
        <div class="vault-doc-card__head">
          <h4>${e.esc(M.title)}</h4>
          <span class="world-meta">${e.esc(M.filename||"")}${e.esc(x)} \xB7 ${e.formatBytes(M.size_bytes)}${M.source_type==="github"?" \xB7 GitHub":""}</span>
        </div>
        <p class="body-md">${e.esc(M.description||"No description")}</p>
        <div class="vault-doc-card__actions">
          ${j?`<button type="button" class="button-primary button-sm" data-vault-view-doc="${M.id}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(M.title)}">View</button>`:""}
          <button type="button" class="button-outline-on-dark button-sm" data-tag-vault-doc="${M.id}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(M.title)}" data-doc-path="${e.esc(M.github_path||M.filename||"")}">Tag in agent</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-edit-doc="${M.id}">Edit</button>
          <button type="button" class="button-tertiary-text button-sm" data-vault-delete-doc="${M.id}">Remove</button>
        </div>
      </article>`}).join(""),E=(p.find(M=>(M.id||M.folder)===L)||{}).files||[],W=E.length?`<ul class="vault-file-list">${E.map(M=>`<li class="mono">${e.esc(M.relative||M.name)} <span class="muted">on disk</span></li>`).join("")}</ul>`:"";return`
      <section class="driver-card vault-panel knowledge-panel" style="margin-top:var(--space-md)">
        <div class="vault-panel-head">
          <div>
            <p class="section-eyebrow">Knowledge graph</p>
            <h3 class="title-sm">${e.esc(n.name)} \u2014 ${e.esc(l.template_id||n.template||"startup")} template</h3>
            <p class="body-md muted">Category slots for this world type. Add docs with a searchable description; large files live in ${e.esc(e.vaultStorageLabel())}. Open the <strong>Files</strong> tab in the map above for the folder graph.</p>
            <p class="world-meta">${l.document_count||0} registered docs \xB7 ${e.esc(l.vault_path||"")}${l.repo_path?` \xB7 repo: ${e.esc(l.repo_path)}`:""}</p>
          </div>
          <div class="vault-panel-actions">
            <button type="button" class="button-primary button-sm" data-vault-add-doc="${e.esc(n.id)}">Add document</button>
            <button type="button" class="button-outline-on-dark button-sm" data-world-graph-tab="vault">Open file map</button>
            <input class="text-input-on-dark" id="vault-repo-path" placeholder="Local repo path" value="${e.esc(n.repo_path||"")}">
            <button type="button" class="button-outline-on-dark button-sm" data-vault-link="${e.esc(n.id)}">Link repo</button>
            <button type="button" class="button-outline-on-dark button-sm" data-vault-ingest="${e.esc(n.id)}">Re-ingest</button>
          </div>
        </div>
        ${e.renderGithubReposPanel(n,l)}
        ${e.renderVaultRegistryBar(l,n)}
        <div class="vault-facet-tabs" role="tablist">${B||"<span class='muted'>No categories</span>"}</div>
        ${V?e.renderVaultDocForm(n,p,L):""}
        <div class="vault-doc-grid">${Y||"<p class='body-md muted'>No documents in this slot yet \u2014 add your ICP, GTM notes, research, etc.</p>"}</div>
        ${W}
        <div class="vault-search-row">
          <input class="text-input-on-dark" id="vault-search-q" placeholder="Search descriptions in this world\u2026">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-search="${e.esc(n.id)}">Search</button>
        </div>
        <pre class="vault-search-results mono" id="vault-search-results" hidden></pre>
      </section>`}function i(){let n=e.state._worldFull||{},l=n.worlds||e.state.worlds||{},p=l.root||{},v=l.children||[],L=e.inspectorWorldId(),V=e.currentWorldId(),N=e.worldById(L)||p,B=n.snapshot||e.state.snapshot||{},Y=e.state.config?.my_name||"You";e.isRootWorld(N)&&e.worldGraphTab==="vault"&&(e.worldGraphTab="hierarchy");let E=!e.isRootWorld(N);return`
      <div class="worlds-page">
        <section class="worlds-hero">
          <div class="worlds-hero-lead">
            <h2>${e.esc(Y)}'s world map</h2>
            <p><strong>Your venture map</strong> \u2014 create worlds, set context, link doc repos, and switch active context. You define each world; agents read what you write.</p>
          </div>
          <div class="worlds-stat">
            <span class="n">${v.length+1}</span>
            <span class="l">Worlds</span>
          </div>
          <div class="worlds-stat">
            <span class="n">${v.length}</span>
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
              ${e.renderWorldTreeNav(p,v,L,V)}
            </div>
          </section>
  
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Map</h3>
              <div class="world-graph-tabs" role="tablist">
                <button type="button" class="world-graph-tab${e.worldGraphTab==="hierarchy"?" is-active":""}" data-world-graph-tab="hierarchy">Hierarchy</button>
                <button type="button" class="world-graph-tab${e.worldGraphTab==="ecosystem"?" is-active":""}" data-world-graph-tab="ecosystem">Ecosystem</button>
                ${E?`<button type="button" class="world-graph-tab${e.worldGraphTab==="vault"?" is-active":""}" data-world-graph-tab="vault">Files</button>`:""}
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
              ${e.renderWorldInspector(N,B)}
            </div>
          </section>
        </div>
  
        ${e.isRootWorld(N)?"":`<div id="world-vault-mount">${e.renderWorldVaultPanel(N)}</div>`}
  
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
      </div>`}function u(n){return!n||n.id==="root"}async function _(n){let l=new FormData(n),p=(l.get("name")||"").toString().trim();if(p)try{let v=await e.api("/worlds",{method:"POST",body:JSON.stringify({name:p,kind:(l.get("kind")||"project").toString(),template:(l.get("template")||"").toString().trim()||void 0,description:(l.get("description")||"").toString().trim(),context:(l.get("context")||"").toString().trim(),repo_path:(l.get("repo_path")||"").toString().trim(),github_repo:(l.get("github_repo")||"").toString().trim()})});e.state.worlds=v.tree,e.setActiveWorld(v.world?.id),await e.refresh(),e.currentView==="world"&&(await e.reloadWorldTree(),e.selectInspectorWorld(v.world?.id)),n.reset(),e.state.ui&&(e.state.ui.worldCreateOpen=!1)}catch(v){alert(v.message)}}async function I(n){let l=n.dataset.worldId;if(!l)return;let p=new FormData(n),v={name:(p.get("name")||"").toString().trim(),description:(p.get("description")||"").toString(),context:(p.get("context")||"").toString()};if(l!=="root"){v.kind=(p.get("kind")||"project").toString();let L=(p.get("template")||"").toString().trim();L&&(v.template=L)}try{let L=await e.api(`/worlds/${encodeURIComponent(l)}`,{method:"PATCH",body:JSON.stringify(v)});e.state.worlds=L.tree,e.state.worldEditing=null,e.currentView==="world"?(await e.reloadWorldTree(),await e.reloadVault(l,{force:!0}),e.patchWorldPanels()):await e.refresh()}catch(L){alert(L.message)}}async function T(n){let l=n.dataset.worldId,p=(n.querySelector("[name=doc_id]")?.value||"").trim(),v=new FormData(n),L=(v.get("title")||"").toString().trim(),V=(v.get("facet_id")||n.dataset.facetId||"docs").toString(),N=(v.get("description")||"").toString().trim(),B=(v.get("content")||"").toString(),Y=n.querySelector('input[type="file"]')?.files?.[0];try{if(p)await e.api(`/worlds/${encodeURIComponent(l)}/vault/documents/${encodeURIComponent(p)}`,{method:"PATCH",body:JSON.stringify({title:L,description:N,facet_id:V,content:B||void 0})});else if(Y){let E=new FormData;E.append("file",Y),E.append("title",L),E.append("description",N),E.append("facet_id",V),await e.apiUpload(`/worlds/${encodeURIComponent(l)}/vault/documents`,E)}else if(B.trim())await e.api(`/worlds/${encodeURIComponent(l)}/vault/documents`,{method:"POST",body:JSON.stringify({title:L,description:N,facet_id:V,content:B})});else return alert("Upload a file or paste markdown content.");e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),await e.reloadVault(l,{force:!0}),e.afterVaultMutation(l)}catch(E){alert(E.message)}}async function F(n,l){e.state.ui||(e.state.ui={});try{let p=await e.api(`/worlds/${encodeURIComponent(n)}/vault/documents/${encodeURIComponent(l)}/content`);e.state.ui.vaultDocEdit=p.document,e.state.ui.vaultDocForm=!0,e.state.ui.vaultFacet=p.document?.facet_id||e.state.ui.vaultFacet,e.currentView==="world"?e.patchWorldPanels():e.render();let v=e.$("#vault-doc-content");v&&(v.value=p.content||"")}catch(p){alert(p.message)}}async function U(n){let l=e.$("#github-repo-pick")?.value?.trim();if(!l)return alert("Select a repository");let p=document.querySelector(`[data-github-add="${n}"]`);p&&(p.disabled=!0);try{let v=await e.api(`/worlds/${encodeURIComponent(n)}/repos`,{method:"POST",body:JSON.stringify({full_name:l}),timeoutMs:12e4});if(v.job?.status==="failed")throw new Error(v.job.message||"Could not start sync");v.job?.id?await e.runGithubSyncJob(v.job.id,`Syncing ${l}`,{worldId:n,linkId:v.repo?.id}):(await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n))}catch(v){alert(v.message)}finally{p&&(p.disabled=e.state._syncingLinkIds.size>0)}}async function z(n,l){if(!e.isLinkSyncing(l))try{let p=await e.api(`/worlds/${encodeURIComponent(n)}/repos/${encodeURIComponent(l)}/sync`,{method:"POST",body:"{}",timeoutMs:12e4});if(p.job?.status==="failed")throw new Error(p.job.message||"Could not start sync");if(p.job?.id){let v=(e.state._worldVault?.github_repos||[]).find(L=>String(L.id)===String(l))?.full_name||"repository";await e.runGithubSyncJob(p.job.id,`Re-syncing ${v}`,{worldId:n,linkId:l})}}catch(p){alert(p.message)}}async function ee(n,l){if(confirm("Unlink this repo and remove its synced documents from this world?"))try{await e.api(`/worlds/${encodeURIComponent(n)}/repos/${encodeURIComponent(l)}`,{method:"DELETE"}),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(p){alert(p.message)}}async function Z(n,l){if(confirm("Remove this document from the knowledge graph?"))try{await e.api(`/worlds/${encodeURIComponent(n)}/vault/documents/${encodeURIComponent(l)}`,{method:"DELETE"}),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(p){alert(p.message)}}async function te(n){try{let l=await e.api(`/worlds/${encodeURIComponent(n)}/vault/ingest`,{method:"POST",body:"{}"});alert(`Ingested ${l.files||0} files (${l.total_chunks||0} chunks)`),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(l){alert(l.message)}}async function h(n){let l=e.$("#vault-repo-path")?.value?.trim();if(!l)return alert("Enter a local repo path");try{let p=await e.api(`/worlds/${encodeURIComponent(n)}/vault/link-repo`,{method:"POST",body:JSON.stringify({repo_path:l})});if(p.error)return alert(p.error);alert(`Linked and ingested ${p.files||0} files`),await e.reloadVault(n,{force:!0}),await e.refresh(),e.afterVaultMutation(n)}catch(p){alert(p.message)}}async function $(n){let l=e.$("#vault-search-q")?.value?.trim();if(!l)return;let p=e.$("#vault-search-results");try{let L=((await e.api(`/vault/search?${new URLSearchParams({q:l,world_id:n})}`)).hits||[]).map(V=>`[${V.metadata?.domain||"?"}] ${V.metadata?.source||""}
${(V.text||"").slice(0,200)}`).join(`

---

`)||"No hits.";p&&(p.textContent=L,p.hidden=!1)}catch(v){p&&(p.textContent=v.message,p.hidden=!1)}}async function P(n){if(confirm("Delete this sub-world?"))try{let l=await e.api(`/worlds/${encodeURIComponent(n)}`,{method:"DELETE"});e.state.worlds=l.tree,e.currentWorldId()===n&&e.setActiveWorld("root"),e.inspectorWorldId()===n&&e.selectInspectorWorld("root"),await e.refresh(),e.currentView==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.render())}catch(l){alert(l.message)}}e.renderWorldOptionsForDocs=S,e.githubRepoDocuments=k,e.findReadmeDoc=b,e.countGithubTreeFiles=s,e.renderGithubTreeNode=g,e.tagVaultDocInChat=c,e.buildVaultGraph=m,e.vaultGraphForWorld=o,e.worldGraphLegendHtml=t,e.renderWorldCreateForm=a,e.worldById=d,e.inspectorWorldId=r,e.loadWorldVault=f,e.reloadVault=R,e.reloadWorldTree=A,e.ensureVaultForWorld=y,e.patchWorldTreeNav=w,e.patchWorldPanels=O,e.onWorldContextChanged=D,e.selectInspectorWorld=G,e.renderWorldTreeNav=q,e.renderWorldInspector=K,e.renderVaultDocForm=Q,e.renderGithubReposPanel=ae,e.renderVaultRegistryBar=J,e.renderWorldVaultPanel=C,e.renderWorld=i,e.isRootWorld=u,e.createWorldFromForm=_,e.saveWorldEdit=I,e.submitVaultDoc=T,e.startVaultDocEdit=F,e.connectGithubRepo=U,e.syncGithubRepo=z,e.unlinkGithubRepo=ee,e.deleteVaultDoc=Z,e.vaultIngest=te,e.vaultLinkRepo=h,e.vaultSearch=$,e.deleteWorld=P}function ke(e){function S(){let w=e.state.ui?.crmTab||localStorage.getItem("fos_crm_tab")||"contacts";return w==="outreach"?"contacts":w}function k(w){let O=e.state.worlds||e.state._worldFull?.worlds||{},D=O.root,G=O.children||[],q=[];return D&&q.push(`<option value="${e.esc(D.id||"root")}"${(w||"root")===(D.id||"root")?" selected":""}>${e.esc(D.name||"Main world")}</option>`),G.forEach(K=>{q.push(`<option value="${e.esc(K.id)}"${w===K.id?" selected":""}>${e.esc(K.name||K.id)}</option>`)}),q.join("")}function b(w={}){let O=e.crmTab();return`<nav class="crm-tabs" role="tablist" aria-label="CRM sections">${[["contacts","Contacts",w.contacts],["companies","Companies",w.companies],["pipeline","Pipeline",null]].map(([G,q,K])=>`<button type="button" role="tab" aria-selected="${O===G}" class="crm-tab${O===G?" crm-tab--active":""}" data-crm-tab="${G}">${e.esc(q)}${K!=null?`<span class="crm-tab__count">${K}</span>`:""}</button>`).join("")}</nav>`}function s(){let w=e.state._crm?.contacts||[],O=e.state._crm?.followups_due||[],D=!!e.state.ui?.crmFormOpen,G=e.state._crmCompanies?.companies||[],q=J=>e.CRM_STATUSES.map(C=>`<option value="${C}"${C===J?" selected":""}>${e.esc(C)}</option>`).join(""),K='<option value="">\u2014 None \u2014</option>'+G.map(J=>`<option value="${J.id}">${e.esc(J.name)}</option>`).join(""),Q=w.slice(0,50).map(J=>`<tr>
      <td>${e.esc(J.name)}</td><td>${e.esc(J.company||"\u2014")}</td><td>${e.esc(J.role||"\u2014")}</td>
      <td><select class="text-input-on-dark crm-status-select" data-crm-status="${J.id}" aria-label="Status for ${e.esc(J.name)}">${q(J.status||"prospect")}</select></td>
      <td class="muted">${e.esc(J.email||"")}</td>
      <td class="muted">${e.esc(J.phone||"")}</td>
      <td><label class="human-field--checkbox" style="margin:0">
        <input type="checkbox" data-crm-whatsapp="${J.id}" ${J.whatsapp_enabled?"checked":""} ${J.phone?"":"disabled"} aria-label="Allow WhatsApp for ${e.esc(J.name)}">
      </label></td>
      <td>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${J.id}" data-followup-days="3">3d</button>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${J.id}" data-followup-days="7">7d</button>
        ${J.whatsapp_enabled?`<button type="button" class="button-tertiary-text button-sm" data-crm-wa-thread="${J.id}">WA</button>`:""}
      </td></tr>`).join(""),ae=O.map(J=>`<li class="crm-followup-row">
      <span>${e.esc(J.name)} @ ${e.esc(J.company||"?")}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goto="crm">Open</button>
    </li>`).join("")||"<li class='muted'>None due</li>";return`
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Contacts</p>
            <h3 class="title-sm">People &amp; follow-ups</h3>
          </div>
          <button type="button" class="button-primary button-sm" data-toggle-ui="crmFormOpen">${D?"Hide form":"Add contact"}</button>
        </div>
        ${D?`
        <form class="human-form" id="crm-create-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Full name"></label>
            <label class="human-field"><span class="caption-uppercase">Company</span>
              <select class="text-input-on-dark" name="company_id">${K}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Role</span>
              <input class="text-input-on-dark" name="role" placeholder="Title"></label>
            <label class="human-field"><span class="caption-uppercase">Email</span>
              <input class="text-input-on-dark" name="email" type="email" placeholder="email@company.com"></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${q("prospect")}</select></label>
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
      <section class="driver-card span-12"><p class="caption-uppercase">Follow-ups due</p><ul class="list-plain" style="margin-top:var(--space-sm)">${ae}</ul></section>
      <section class="band-light span-12">
        <p class="caption-uppercase" style="color:var(--color-muted)">Contacts (${w.length})</p>
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Role</th><th>Status</th><th>Email</th><th>Phone</th><th>WA</th><th>Follow up</th></tr></thead>
        <tbody>${Q||'<tr><td colspan="8" class="muted">No contacts yet \u2014 use Add contact above.</td></tr>'}</tbody></table></div>
        ${e.state._crmWaThread?.length?`<div class="driver-card" style="margin-top:var(--space-md)">
          <p class="caption-uppercase">WhatsApp thread</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${e.state._crmWaThread.map(J=>`<li><span class="muted">${e.esc((J.sent_at||"").slice(0,16).replace("T"," "))}</span> <strong>${e.esc(J.direction||"")}</strong>: ${e.esc((J.body||"").slice(0,200))}</li>`).join("")}</ul>
        </div>`:""}
      </section>`}function g(){if(e.state._crmCompaniesLoading)return`<section class="driver-card span-12 crm-loading-panel" aria-busy="true">
        <div class="crm-skeleton crm-skeleton--title"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
      </section>`;if(e.state._crmCompaniesError)return`<section class="driver-card span-12 crm-error-panel">
        <p class="body-md">Could not load companies \u2014 ${e.esc(e.state._crmCompaniesError)}</p>
        <button type="button" class="button-primary button-sm" data-crm-reload>Retry</button>
      </section>`;let w=e.state._crmCompanies?.companies||[],O=e.state._crmCompanies?.meta?.unlinked_contact_companies||0,D=!!e.state.ui?.crmCompanyFormOpen,G=e.state.ui?.crmCompanyDetail,q=e.currentWorldId(),K=i=>e.COMPANY_STATUSES.map(u=>`<option value="${u}"${u===i?" selected":""}>${e.esc(u)}</option>`).join(""),Q=w.map(i=>`<tr>
      <td><button type="button" class="button-tertiary-text" data-crm-company-detail="${i.id}">${e.esc(i.name)}</button></td>
      <td>${e.esc(i.sector||i.industry||"\u2014")}</td>
      <td><span class="crm-status-pill crm-status-pill--${e.esc((i.status||"prospect").replace(/\s+/g,"-"))}">${e.esc(i.status||"prospect")}</span></td>
      <td>${i.contact_count??0}</td>
      <td class="muted">${e.esc((i.last_contacted_at||"").slice(0,10))}</td>
    </tr>`).join(""),ae="";if(G){let i=w.find(_=>String(_.id)===String(G))||e.state._crmCompanyDetail?.company,u=e.state._crmCompanyDetail?.contacts||[];i&&(ae=`<aside class="crm-company-drawer driver-card">
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
          <ul class="list-plain">${u.map(_=>`<li>${e.esc(_.name)} \u2014 ${e.esc(_.role||"")} ${_.email?`<span class="muted">${e.esc(_.email)}</span>`:""}</li>`).join("")||"<li class='muted'>None</li>"}</ul>
        </aside>`)}let J=O>0?`
      <div class="crm-import-banner">
        <div>
          <p class="body-md"><strong>${O}</strong> unique company name${O===1?"":"s"} on contacts not yet linked to company records.</p>
          <p class="body-sm muted">Import creates company rows and links your existing contacts automatically.</p>
        </div>
        <button type="button" class="button-primary button-sm" data-crm-import-companies>Import from contacts</button>
      </div>`:"",C=Q?"":`
      <div class="crm-empty-state">
        <p class="body-md">No company records yet.</p>
        <p class="body-sm muted">${O>0?"Import from contacts above, or add a company manually.":"Add companies manually, or enter company names when adding contacts."}</p>
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
            <button type="button" class="button-primary button-sm" data-toggle-ui="crmCompanyFormOpen">${D?"Hide form":"Add company"}</button>
          </div>
        </div>
        ${J}
        ${D?`
        <form class="human-form" id="crm-company-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Company name"></label>
            <label class="human-field"><span class="caption-uppercase">World</span>
              <select class="text-input-on-dark" name="world_id" required>${e.renderWorldOptionsForCrm(q)}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Sector</span>
              <input class="text-input-on-dark" name="sector" placeholder="e.g. Manufacturing"></label>
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${K("prospect")}</select></label>
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
        ${C||`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Sector</th><th>Status</th><th>Contacts</th><th>Last contact</th></tr></thead>
        <tbody>${Q}</tbody></table></div>`}
        ${ae}
      </section>`}function c(){let w=e.state._crm?.pipeline||{},O=Object.entries(w).map(([K,Q])=>`<div class="kv"><span class="k">${e.esc(K)}</span><span class="v">${Q}</span></div>`).join("")||"<p class='muted'>No pipeline data</p>",D=e.state._crmCompanies?.companies||[],G={};D.forEach(K=>{let Q=K.status||"prospect";G[Q]=(G[Q]||0)+1});let q=Object.entries(G).map(([K,Q])=>`<div class="kv"><span class="k">${e.esc(K)}</span><span class="v">${Q} companies</span></div>`).join("")||"<p class='muted'>No company pipeline data</p>";return`<section class="driver-card span-6"><p class="caption-uppercase">Contact pipeline</p><div style="margin-top:var(--space-sm)">${O}</div></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Company pipeline</p><div style="margin-top:var(--space-sm)">${q}</div></section>`}function m(){let w=e.crmTab(),O={contacts:e.state._crm?.contacts?.length||0,companies:e.state._crmCompanies?.companies?.length||0},D="";return w==="contacts"?D=e.renderCrmContactsPanel():w==="companies"?D=e.renderCrmCompaniesPanel():D=e.renderCrmPipelinePanel(),`<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <h2 class="title-md" style="text-wrap:balance">CRM</h2>
            <p class="body-sm muted">Contacts, companies, and pipeline. Batch outreach lives on the <button type="button" class="button-tertiary-text button-sm" data-goto="outreach">Outreach</button> page.</p>
          </div>
        </div>
        ${e.renderCrmTabs(O)}
      </section>
      ${D}
    </div>`}async function o(){let w=e.crmTab(),O=e.currentWorldId(),D=w==="companies"?"?include_unassigned=1":O&&O!=="root"?`?world_id=${encodeURIComponent(O)}&include_unassigned=1`:"?include_unassigned=1";e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[G,q]=await Promise.all([e.api("/crm/contacts"),e.api(`/crm/companies${D}`)]);e.state._crm=G,e.state._crmCompanies=q}catch(G){e.state._crmCompaniesError=G.message||"Could not load CRM data"}finally{e.state._crmCompaniesLoading=!1}}async function t(w){let O=new FormData(w),D=(O.get("name")||"").toString().trim();if(!D)return;let G=(O.get("company_id")||"").toString().trim();try{await e.api("/crm/contacts",{method:"POST",body:JSON.stringify({name:D,company_id:G?parseInt(G,10):null,role:(O.get("role")||"").toString().trim(),email:(O.get("email")||"").toString().trim(),status:(O.get("status")||"prospect").toString(),linkedin_url:(O.get("linkedin_url")||"").toString().trim(),phone:(O.get("phone")||"").toString().trim(),whatsapp_enabled:O.get("whatsapp_enabled")==="1",notes:(O.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmFormOpen=!1),await e.refresh(),e.render(),w.reset()}catch(q){alert(q.message)}}async function a(){let w=e.currentWorldId(),O=w&&w!=="root"?w:null;try{let D=await e.api("/crm/companies/import-from-contacts",{method:"POST",body:JSON.stringify({world_id:O})});await e.loadCrmData(),e.render();let G=`Imported ${D.created||0} companies and linked ${D.linked_contacts||0} contacts.`;e.state._toast?e.state._toast(G):alert(G)}catch(D){alert(D.message)}}async function d(w){let O=new FormData(w),D=(O.get("name")||"").toString().trim(),G=(O.get("world_id")||"").toString().trim();if(!(!D||!G))try{await e.api("/crm/companies",{method:"POST",body:JSON.stringify({name:D,world_id:G,sector:(O.get("sector")||"").toString().trim(),status:(O.get("status")||"prospect").toString(),website:(O.get("website")||"").toString().trim(),linkedin_url:(O.get("linkedin_url")||"").toString().trim(),notes:(O.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmCompanyFormOpen=!1),e.render(),w.reset()}catch(q){alert(q.message)}}async function r(w){if(w)try{let O=await e.api(`/crm/companies/${encodeURIComponent(w)}`);e.state._crmCompanyDetail=O,e.state.ui||(e.state.ui={}),e.state.ui.crmCompanyDetail=w,e.render()}catch(O){alert(O.message)}}async function f(w,O){if(!(!w||!O))try{await e.api(`/crm/contacts/${encodeURIComponent(w)}`,{method:"PATCH",body:JSON.stringify({status:O})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(D){alert(D.message)}}async function R(w,O){if(w)try{await e.api(`/crm/contacts/${encodeURIComponent(w)}`,{method:"PATCH",body:JSON.stringify({whatsapp_enabled:!!O})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(D){alert(D.message)}}async function A(w){if(w)try{let O=await e.api(`/whatsapp/messages?contact_id=${encodeURIComponent(w)}`);e.state._crmWaThread=O.messages||[],e.render()}catch(O){alert(O.message)}}async function y(w,O){let D=parseInt(O,10)||7;await e.api(`/crm/contacts/${w}/followup`,{method:"POST",body:JSON.stringify({days:D}),timeoutMs:15e3}),e.state._crm=await e.api("/crm/contacts"),e.currentView==="crm"&&e.render()}e.crmTab=S,e.renderWorldOptionsForCrm=k,e.renderCrmTabs=b,e.renderCrmContactsPanel=s,e.renderCrmCompaniesPanel=g,e.renderCrmPipelinePanel=c,e.renderCrm=m,e.loadCrmData=o,e.submitCrmContact=t,e.importCrmCompaniesFromContacts=a,e.submitCrmCompany=d,e.openCrmCompanyDetail=r,e.updateCrmStatus=f,e.updateCrmWhatsapp=R,e.loadCrmWaThread=A,e.scheduleCrmFollowup=y}function Ce(e){function S(){return e.state.ui?.crmOutreachWorld||e.currentWorldId()}function k(){let h=e.routeParams?.campaignId,$=e.state.ui?.crmCampaignId;return h||$||null}async function b(){let h=k();h&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${h}/review`),e.render(),e.fitAllOutreachTextareas?.())}function s(){let h=e.state._crmCampaignReview,$=h?.campaign;return $?.status==="done"||h?.done&&!h?.pending_count?"complete":h?.campaign&&["review"].includes($.status)&&h.pending_count>0?"review":h?.campaign&&["review"].includes($.status)&&!h.pending_count?"complete":e.state._crmOutreachJob?.active||["researching","drafting","created"].includes($?.status||e.state._crmOutreachJob?.status)||e.state.ui?.crmCampaignId&&$&&!["review","done","failed"].includes($.status)?"running":"setup"}function g(){return e.state.ui?.crmOutreachBatch||5}function c(){return e.state.ui?.crmOutreachSelected||[]}function m(){return e.state.ui||(e.state.ui={}),Array.isArray(e.state.ui.crmOutreachDraft)||(e.state.ui.crmOutreachDraft=[...c()]),e.state.ui.crmOutreachDraft}function o(){let h=[...m()].sort((P,n)=>P-n).join(","),$=[...c()].sort((P,n)=>P-n).join(",");return h!==$}function t(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachDraft=[],e.state.ui.crmOutreachSelected=[]}function a(){e.state.ui||(e.state.ui={}),Array.isArray(e.state.ui.crmOutreachDraft)||(e.state.ui.crmOutreachDraft=[...c()])}function d(){let h=g(),$=new Set(m()),P=c().length,n=o(),l=document.getElementById("outreach-company-picker");if(!l)return;l.querySelectorAll("[data-crm-company-toggle]").forEach(M=>{let x=parseInt(M.dataset.crmCompanyToggle,10),j=$.has(x);M.checked=j,M.disabled=!j&&$.size>=h,M.closest(".outreach-company-row")?.classList.toggle("is-selected",j)});let p=l.querySelector(".outreach-select-meter__fill");p&&(p.style.width=`${Math.min(100,$.size/h*100)}%`);let v=document.getElementById("outreach-draft-count");v&&(v.textContent=String($.size));let L=document.getElementById("outreach-batch-max");L&&(L.textContent=` / ${h}`);let V=document.getElementById("outreach-select-meter");V&&(V.setAttribute("aria-valuenow",String($.size)),V.setAttribute("aria-valuemax",String(h)));let N=document.getElementById("outreach-saved-count");N&&(N.textContent=String(P));let B=document.getElementById("outreach-selection-dirty");B&&(B.hidden=!n);let Y=document.getElementById("outreach-save-companies");Y&&(Y.disabled=!n||$.size===0,Y.classList.toggle("is-pulse",n&&$.size>0));let E=document.getElementById("outreach-start-btn");if(E){let M=S(),x=P>0&&M!=="root"&&!n;E.disabled=!x,n?E.title="Save your company selection before starting":P?E.title="":E.title="Select and save at least one company"}let W=document.getElementById("outreach-batch-hint");W&&(W.textContent=$.size>=h?`Batch limit reached (${h})`:`Up to ${h} companies per campaign`)}function r(h){let $=parseInt(h.dataset.crmCompanyToggle,10);if(!$)return;e.state.ui||(e.state.ui={});let P=g(),n=new Set(m());if(h.checked){if(n.size>=P){h.checked=!1;return}n.add($)}else n.delete($);e.state.ui.crmOutreachDraft=[...n],d()}function f(){e.state.ui||(e.state.ui={});let h=m();if(!h.length)return;e.state.ui.crmOutreachSelected=[...h];let $=S();if($)try{localStorage.setItem(`fos_outreach_sel_${$}`,JSON.stringify(h))}catch{}d();let P=document.getElementById("outreach-save-companies");P&&(P.classList.add("is-saved-flash"),setTimeout(()=>P?.classList.remove("is-saved-flash"),600))}function R(h){e.state.ui||(e.state.ui={});let $=parseInt(h,10)||5;e.state.ui.crmOutreachBatch=$;let P=m();P.length>$&&(e.state.ui.crmOutreachDraft=P.slice(0,$)),d()}function A(h){let $=(h||"").trim().toLowerCase();document.querySelectorAll("#outreach-company-picker .outreach-company-row").forEach(P=>{let n=(P.dataset.search||"").toLowerCase();P.hidden=!!($&&!n.includes($))})}function y(){let h=S();return(e.state._crmCompanies?.companies||[]).filter($=>h&&h!=="root"&&$.world_id&&$.world_id!==h?!1:$.status==="prospect"||!$.status)}function w(h){if(!h||h.tagName!=="TEXTAREA")return;h.style.height="0px";let $=getComputedStyle(h),P=parseFloat($.minHeight)||112;h.style.height=`${Math.max(P,h.scrollHeight)}px`,h.style.overflowY="hidden"}function O(h=document){let $=[...h.querySelectorAll(".crm-draft-body--fit, .outreach-auto-textarea")];if(!$.length)return;let P=()=>$.forEach(w);P(),requestAnimationFrame(()=>{P(),requestAnimationFrame(P)})}function D(h){if(h.channel==="email"){if(!(h.subject||"").trim())return"Subject required";if(!(h.body||"").trim())return"Body required";if(!(h.email||"").trim())return"Contact has no email"}if(h.channel==="whatsapp"){if(!(h.body||"").trim())return"Message required";if((h.body||"").length>300)return"Max 300 characters";if(!h.whatsapp_enabled)return"WhatsApp not allowlisted";if(!(h.phone||"").trim())return"No phone on contact"}return""}function G(h){let $=[["setup","1. Setup"],["running","2. Research & draft"],["review","3. Review & send"],["complete","4. Done"]],n={setup:0,running:1,review:2,complete:3}[h]??0;return`<nav class="crm-outreach-steps" aria-label="Outreach progress">${$.map(([l,p],v)=>`<span class="${v<n?"crm-outreach-step crm-outreach-step--done":v===n?"crm-outreach-step crm-outreach-step--active":"crm-outreach-step"}">${e.esc(p)}</span>`).join("")}</nav>`}function q(){let h=e.state._crmOutreachJob||{},$=e.state._crmCampaignDetail?.campaign||e.state._crmCampaignReview?.campaign||{},P=h.phase||$.status||"Starting\u2026",l=(e.state._crmCampaignReview?.companies||e.state._crmCampaignDetail?.review?.companies||[]).length||$.batch_size||"?";return`<section class="driver-card span-12 crm-outreach-running">
      <p class="section-eyebrow">Outreach in progress</p>
      <h3 class="title-sm">${e.esc($.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("running")}
      <div class="crm-outreach-progress-strip">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:40%"></div></div>
        <p class="body-md"><strong>${e.esc(P)}</strong></p>
        <p class="muted body-sm">Researching companies via knowledge tree + web, then drafting messages. This runs in the background \u2014 you can leave this page.</p>
        <p class="muted body-sm">Batch: ${l} companies \xB7 World: <span data-active-world-label>${e.esc(e.activeWorldLabel())}</span></p>
      </div>
      <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-refresh>Refresh status</button>
    </section>`}function K(h){let $=h.progress||{},P=$.by_status||{};return`<section class="driver-card span-12">
      <p class="section-eyebrow">Campaign complete</p>
      <h3 class="title-sm">${e.esc(h.campaign?.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("complete")}
      <div class="crm-outreach-summary">
        <div class="kv"><span class="k">Sent</span><span class="v">${P.sent||0}</span></div>
        <div class="kv"><span class="k">Skipped</span><span class="v">${P.skipped||0}</span></div>
        <div class="kv"><span class="k">Failed</span><span class="v">${P.failed||0}</span></div>
        <div class="kv"><span class="k">Companies</span><span class="v">${$.companies_complete||0}/${$.companies_total||0}</span></div>
      </div>
      <div class="human-form__actions" style="margin-top:var(--space-md)">
        <button type="button" class="button-primary button-sm" data-crm-outreach-back>Start new campaign</button>
      </div>
    </section>`}function Q(h){let $=h.campaign,P=h.strategy||{},n=h.current_company,l=h.current_research||{},p=h.current_drafts||[],v=h.progress||{},L=p.filter(W=>W.channel==="email"),V=p.filter(W=>W.channel==="whatsapp"),N=n?.company_name||n?.name||"Company",B=v.company_index||1,Y=v.companies_total||1,E=W=>{let M=e.draftApproveDisabledReason(W),x=(W.body||"").length;return`<div class="crm-draft-card driver-card outreach-draft-card" data-draft-id="${W.id}">
        <div class="crm-draft-card__head">
          <p class="caption-uppercase">${W.channel==="email"?"Gmail":"WhatsApp"} \u2192 ${e.esc(W.contact_name||"Contact")}</p>
          ${W.channel==="email"?`<span class="muted body-sm">${e.esc(W.email||"")}</span>`:`<span class="muted body-sm">${e.esc(W.phone||"")}</span>`}
        </div>
        ${W.personalization_notes?`<p class="body-md muted outreach-draft-notes">${e.esc(W.personalization_notes)}</p>`:""}
        ${W.channel==="email"?`<label class="human-field outreach-draft-field"><span class="caption-uppercase">Subject</span>
          <input class="text-input-on-dark crm-draft-subject" data-draft-id="${W.id}" value="${e.esc(W.subject||"")}"></label>`:""}
        <label class="human-field outreach-draft-field"><span class="caption-uppercase">Message</span>
          <textarea class="text-input-on-dark crm-draft-body crm-draft-body--fit" data-draft-id="${W.id}" data-channel="${e.esc(W.channel)}" rows="1">${e.esc(W.body||"")}</textarea>
          ${W.channel==="whatsapp"?`<span class="caption muted crm-wa-count" data-draft-id="${W.id}">${x}/300</span>`:""}
        </label>
        <div class="human-form__actions">
          <button type="button" class="button-primary button-sm" data-crm-draft-approve="${W.id}" ${M?'disabled title="'+e.esc(M)+'"':""}>Approve &amp; Send</button>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-draft-skip="${W.id}">Skip message</button>
        </div>
        ${W.error_message?`<p class="crm-draft-error">${e.esc(W.error_message)}</p>`:""}
        ${M?`<p class="muted body-sm">${e.esc(M)}</p>`:""}
      </div>`};return`<section class="driver-card span-12 outreach-review">
      <div class="human-panel__head">
        <div>
          <p class="section-eyebrow">Review &amp; send</p>
          <h3 class="title-sm">${e.esc($.name||"Campaign")}</h3>
          <p class="muted body-sm">Company ${B} of ${Y} \xB7 ${h.pending_count||0} message(s) left \u2014 approve one at a time</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-back>Exit review</button>
      </div>
      ${e.renderOutreachSteps("review")}
      <div class="crm-outreach-progress-meta">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:${Math.round((v.companies_complete||0)/Math.max(Y,1)*100)}%"></div></div>
        <div class="crm-outreach-stats">
          <span class="badge-pill">Sent ${(v.by_status||{}).sent||0}</span>
          <span class="badge-pill">Skipped ${(v.by_status||{}).skipped||0}</span>
          <span class="badge-pill">Pending ${h.pending_count||0}</span>
        </div>
      </div>
      <details class="crm-strategy-details">
        <summary class="caption-uppercase">Cohort strategy</summary>
        <pre class="body-sm muted" style="white-space:pre-wrap">${e.esc(JSON.stringify(P,null,2))}</pre>
      </details>
      ${n?`<div class="crm-company-review driver-card outreach-company-review">
        <div class="human-panel__head">
          <h4 class="title-sm">${e.esc(N)}</h4>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-skip-company="${n.company_id??h.current_company_id??""}">Skip company</button>
        </div>
        <p class="body-sm muted">${e.esc(l.sector||n.sector||"")}</p>
        ${l.crm_research_summary?`<p class="body-sm">${e.esc(String(l.crm_research_summary).slice(0,400))}</p>`:""}
        ${(l.web_hits||[]).length?`<p class="caption-uppercase">Web signals</p><ul class="list-plain">${l.web_hits.slice(0,3).map(W=>`<li class="body-sm">${e.esc(W.snippet||W.title||"")}${W.url?` <a href="${e.esc(W.url)}" target="_blank" rel="noopener">link</a>`:""}</li>`).join("")}</ul>`:""}
        ${(l.vault_files_used||[]).length?`<p class="caption-uppercase">Vault files used</p><ul class="list-plain">${l.vault_files_used.map(W=>`<li class="body-sm">${e.esc(W.title||"doc #"+W.doc_id)}</li>`).join("")}</ul>`:""}
      </div>`:""}
      ${L.length?'<p class="caption-uppercase">Email drafts</p>':""}
      ${L.map(E).join("")}
      ${V.length?'<p class="caption-uppercase" style="margin-top:var(--space-md)">WhatsApp drafts</p>':""}
      ${V.map(E).join("")}
      ${!p.length&&n?'<p class="muted">No drafts for this company \u2014 contacts may lack email or WhatsApp allowlist.</p>':""}
    </section>`}function ae(h){e.state.ui||(e.state.ui={});let $=[];if(h)try{let P=localStorage.getItem(`fos_outreach_sel_${h}`),n=P?JSON.parse(P):[];$=Array.isArray(n)?n.filter(l=>Number.isFinite(l)):[]}catch{}e.state.ui.crmOutreachSelected=$,e.state.ui.crmOutreachDraft=[...$]}function J(){a();let h=e.state._crmCampaigns?.campaigns||[],$=S(),P=y(),n=g(),l=new Set(m()),p=c().length,v=o(),V=((e.state.worlds||e.state._worldFull?.worlds||{}).children||[]).length>0,N=e.state._crmCompaniesLoading,B=e.state._crmCompaniesError,Y=P.map(j=>{let X=l.has(j.id),se=j.contact_count||0,Ue=`${j.name||""} ${j.sector||""}`.trim();return`<label class="outreach-company-row human-field--checkbox${X?" is-selected":""}" data-search="${e.esc(Ue)}">
        <input type="checkbox" data-crm-company-toggle="${j.id}" ${X?"checked":""} ${l.size>=n&&!X?"disabled":""}>
        <span class="outreach-company-row__main">
          <span class="outreach-company-row__name">${e.esc(j.name)}</span>
          <span class="outreach-company-row__meta muted">${e.esc(j.sector||"\u2014")} \xB7 ${se} contact${se===1?"":"s"}</span>
        </span>
      </label>`}).join(""),E=[5,10,15,20].map(j=>`<option value="${j}"${n===j?" selected":""}>${j}</option>`).join(""),W=h.slice(0,12).map(j=>`<tr>
        <td><button type="button" class="${j.status==="review"?"button-primary":"button-tertiary-text"} button-sm" data-crm-campaign="${j.id}">${e.esc(j.name)}</button></td>
        <td><span class="badge-pill badge-pill--${e.esc(j.status)}">${e.esc(j.status)}</span></td>
        <td class="muted">${e.esc((j.created_at||"").slice(0,10))}</td>
        <td>${j.status==="review"?`<button type="button" class="button-outline-on-dark button-sm" data-crm-campaign="${j.id}">Continue review</button>`:""}</td>
      </tr>`).join("")||'<tr><td colspan="4" class="muted">No campaigns yet</td></tr>',M=P.length?`<div id="outreach-company-picker" class="outreach-company-picker">
          <div class="outreach-picker-toolbar">
            <div class="outreach-picker-toolbar__head">
              <p class="caption-uppercase">Companies</p>
              <div class="outreach-picker-toolbar__counts">
                <span class="outreach-count-pill" title="Currently selected (not yet saved)">
                  <strong id="outreach-draft-count">${l.size}</strong><span class="muted" id="outreach-batch-max"> / ${n}</span>
                </span>
                <span class="outreach-count-pill outreach-count-pill--saved" title="Saved for this campaign">
                  <strong id="outreach-saved-count">${p}</strong> saved
                </span>
                <span id="outreach-selection-dirty" class="outreach-dirty-badge"${v?"":" hidden"}>Unsaved</span>
              </div>
            </div>
            <div class="outreach-select-meter" id="outreach-select-meter" role="progressbar" aria-valuenow="${l.size}" aria-valuemin="0" aria-valuemax="${n}" aria-label="Selection progress">
              <div class="outreach-select-meter__fill" style="width:${Math.min(100,l.size/n*100)}%"></div>
            </div>
            <p class="body-sm muted" id="outreach-batch-hint">${l.size>=n?`Batch limit reached (${n})`:`Pick up to ${n}, then save`}</p>
            <div class="outreach-picker-toolbar__actions">
              <input type="search" id="outreach-company-search" class="text-input-on-dark outreach-company-search" placeholder="Filter companies\u2026" autocomplete="off">
              <button type="button" id="outreach-save-companies" class="button-outline-on-dark button-sm" data-outreach-save-companies ${v&&l.size?"":"disabled"}>Save selection</button>
            </div>
          </div>
          <div class="outreach-company-list">${Y}</div>
        </div>`:`<div class="crm-outreach-empty">
          <p class="body-md">No prospect companies for this world.</p>
          <p class="body-sm muted">Import from CRM contacts or add companies manually, then return here to build a batch.</p>
          <div class="human-form__actions">
            <button type="button" class="button-primary button-sm" data-outreach-open-crm-companies>Open companies in CRM</button>
          </div>
        </div>`,x=p>0&&$!=="root"&&!v;return`<section class="driver-card span-12 human-panel outreach-setup">
      <div class="human-panel__head">
        <div>
          <h3 class="title-sm">Batch outreach</h3>
          <p class="body-sm muted">Pick companies, save your batch, then start \u2014 research and drafts run in the background.</p>
        </div>
      </div>
      ${e.renderOutreachSteps("setup")}
      ${V?"":'<p class="crm-outreach-warn">Create a sub-world under <strong>World</strong> first \u2014 outreach needs a venture context for vault research.</p>'}
      ${B?`<p class="crm-draft-error">${e.esc(B)}</p>`:""}
      <form class="human-form outreach-setup-form" id="crm-outreach-form">
        <div class="outreach-setup-grid">
          <label class="human-field"><span class="caption-uppercase">World</span>
            <select class="text-input-on-dark" name="world_id" id="crm-outreach-world">${e.renderWorldOptionsForCrm($)}</select></label>
          <label class="human-field"><span class="caption-uppercase">Batch size</span>
            <select class="text-input-on-dark" name="batch_size" id="crm-outreach-batch">${E}</select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Outreach brief</span>
          <textarea class="text-input-on-dark outreach-auto-textarea" name="brief" rows="1" placeholder="e.g. Indian manufacturing SMBs \u2014 energy cost savings, 15-min discovery call, direct tone"></textarea></label>
        ${N?'<p class="muted body-sm">Loading companies\u2026</p>':M}
        <div class="human-form__actions outreach-setup-actions">
          <button type="submit" id="outreach-start-btn" class="button-primary" ${x?"":"disabled"}${v?' title="Save your company selection before starting"':p?"":' title="Select and save at least one company"'}>
            Start outreach${p?` (${p} companies)`:""}
          </button>
        </div>
      </form>
      <section class="outreach-history">
        <p class="caption-uppercase">Recent campaigns</p>
        <div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${W}</tbody></table></div>
      </section>
    </section>`}function C(){let h=e.outreachStep(),$=e.state._crmCampaignReview;return h==="running"?e.renderOutreachRunningPanel():h==="complete"&&$?.campaign?e.renderOutreachCompletePanel($):h==="review"&&$?.campaign?e.renderOutreachReviewPanel($):e.renderOutreachSetupPanel()}function i(){return`<div class="dashboard-grid">
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
    </div>`}async function u(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld||(e.state.ui.crmOutreachWorld=e.currentWorldId());let h=e.outreachWorldId(),$=h&&h!=="root"?`?world_id=${encodeURIComponent(h)}&include_unassigned=1`:"?include_unassigned=1",P=h&&h!=="root"?`?world_id=${encodeURIComponent(h)}`:"",n=e.routeParams?.campaignId||e.state.ui?.crmCampaignId;e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[l,p]=await Promise.all([e.api(`/crm/companies${$}`),e.api(`/crm/outreach/campaigns${P}`).catch(()=>({campaigns:[]}))]);if(e.state._crmCompanies=l,e.state._crmCampaigns=p,n||Array.isArray(e.state.ui.crmOutreachDraft)||(c().length?e.state.ui.crmOutreachDraft=[...c()]:ae(h)),n){e.state.ui.crmCampaignId=n;let[v,L]=await Promise.all([e.api(`/crm/outreach/campaigns/${n}`).catch(()=>null),e.api(`/crm/outreach/campaigns/${n}/review`).catch(()=>null)]);e.state._crmCampaignDetail=v,e.state._crmCampaignReview=L?.campaign?L:v?.review;let V=e.state._crmCampaignReview?.campaign||v?.campaign;V&&["researching","drafting","created"].includes(V.status)?(e.state._crmOutreachJob={active:!0,phase:V.status,status:V.status},e.state._crmOutreachPollId||e.pollCrmOutreachJob(n)):V?.status==="review"&&(e.state._crmOutreachJob={phase:"Ready for review",active:!1})}}catch(l){e.state._crmCompaniesError=l.message||"Could not load outreach data"}finally{e.state._crmCompaniesLoading=!1}}async function _(h){let $=new FormData(h),P=($.get("world_id")||"").toString().trim(),n=parseInt($.get("batch_size")||"5",10)||5,l=($.get("brief")||"").toString().trim(),p=c();if(o())return alert("Save your company selection before starting.");if(!P||P==="root")return alert("Select a sub-world for outreach (not Main world).");if(!p.length)return alert("Select and save at least one company.");if(!l)return alert("Add a brief so the agent knows what kind of message to write.");try{let v=await e.api("/crm/outreach/campaigns",{method:"POST",body:JSON.stringify({world_id:P,batch_size:n,brief:l,company_ids:p})});await e.api(`/crm/outreach/campaigns/${v.campaign_id}/start`,{method:"POST"}),e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=[],e.state.ui.crmOutreachDraft=[];try{localStorage.removeItem(`fos_outreach_sel_${P}`)}catch{}e.goView("outreach",{params:{campaignId:v.campaign_id}}),e.pollCrmOutreachJob(v.campaign_id)}catch(v){alert(v.message)}}async function I(h,$=!1){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId);let P=async()=>{try{let n=await e.api(`/crm/outreach/campaigns/${h}`),l=n.campaign||{},p=n.review||{},v=n.job||{};if(e.state._crmCampaignDetail=n,l.status==="review"||l.status==="done"||l.status==="failed"){e.state._crmOutreachJob={active:!1,phase:l.status==="review"?"Ready for review":l.status},e.state._crmCampaignReview=p.campaign?p:await e.api(`/crm/outreach/campaigns/${h}/review`),e.state._crmOutreachPollId=null,e.currentView==="outreach"&&e.render();return}e.state._crmOutreachJob={active:!0,phase:v.phase||l.status||"running\u2026",status:l.status},e.currentView==="outreach"&&e.render(),$||(e.state._crmOutreachPollId=setTimeout(P,2500))}catch{$||(e.state._crmOutreachPollId=setTimeout(P,4e3))}};$?await P():e.state._crmOutreachPollId=setTimeout(P,500)}async function T(h){h&&e.goView("outreach",{params:{campaignId:parseInt(h,10)}})}function F(){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null,e.state.ui&&(e.state.ui.crmCampaignId=null),e.state._crmCampaignReview=null,e.state._crmCampaignDetail=null,e.state._crmOutreachJob=null,e.goView("outreach",{params:{}})}function U(h){r(h)}async function z(h){let $=k(),P=parseInt(h,10);if(!$||!P){alert("Could not skip company \u2014 campaign context missing. Try reopening the campaign from Recent campaigns.");return}try{await e.api(`/crm/outreach/campaigns/${$}/companies/${P}/skip`,{method:"POST"}),await e.refreshOutreachReview()}catch(n){alert(n.message)}}async function ee(h){let $=document.querySelector(`.crm-draft-subject[data-draft-id="${h}"]`),P=document.querySelector(`.crm-draft-body[data-draft-id="${h}"]`),n={};$&&(n.subject=$.value),P&&(n.body=P.value),Object.keys(n).length&&await e.api(`/crm/outreach/drafts/${h}`,{method:"PATCH",body:JSON.stringify(n)})}async function Z(h){if(h)try{await e.saveCrmDraftEdits(h);let $=await e.api(`/crm/outreach/drafts/${h}/approve-send`,{method:"POST"});if($.error)return alert($.error);await e.refreshOutreachReview()}catch($){alert($.message)}}async function te(h){if(h)try{await e.api(`/crm/outreach/drafts/${h}/skip`,{method:"POST"}),await e.refreshOutreachReview()}catch($){alert($.message)}}e.outreachWorldId=S,e.outreachCampaignId=k,e.refreshOutreachReview=b,e.outreachStep=s,e.draftApproveDisabledReason=D,e.renderOutreachSteps=G,e.renderOutreachRunningPanel=q,e.renderOutreachCompletePanel=K,e.renderOutreachReviewPanel=Q,e.renderOutreachSetupPanel=J,e.renderOutreachBody=C,e.renderOutreach=i,e.loadOutreachData=u,e.submitCrmOutreach=_,e.pollCrmOutreachJob=I,e.openCrmCampaignReview=T,e.closeCrmCampaignReview=F,e.fitOutreachTextarea=w,e.fitAllOutreachTextareas=O,e.toggleOutreachDraftCompany=r,e.saveOutreachCompanySelection=f,e.setOutreachBatchSize=R,e.filterOutreachCompanyList=A,e.syncOutreachCompanyPickerUi=d,e.restoreOutreachSelectionForWorld=ae,e.resetOutreachCompanySelection=t,e.toggleCrmOutreachCompany=U,e.skipCrmCompany=z,e.saveCrmDraftEdits=ee,e.approveCrmDraft=Z,e.skipCrmDraft=te}function Ie(e){function S(){let c=e.state._goals||{},m=!!e.state.ui?.goalsFormOpen,o=!!e.state.ui?.reminderFormOpen,t=(c.active||[]).map(f=>`<li class="goal-row">
      <span><strong>${e.esc(f.title)}</strong>${f.detail?" \u2014 "+e.esc(f.detail):""}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goal-done="${f.id}">Done</button>
    </li>`).join("")||"<li class='muted'>No active goals \u2014 add one below.</li>",a=(e.state.tasks||[]).map(f=>`<li>${e.esc(f.title)} <span class="muted">P${f.priority||3}</span></li>`).join("")||"<li class='muted'>No open tasks</li>",d=(c.reminders||[]).map(f=>`<li class="reminder-row">
      <span>${e.esc(f.text)} <span class="muted">${e.esc((f.due_at||"").slice(0,16).replace("T"," "))}</span></span>
      <span class="reminder-row__actions">
        <button type="button" class="button-outline-on-dark button-sm" data-reminder-done="${f.id}">Done</button>
        <button type="button" class="button-tertiary-text button-sm" data-reminder-cancel="${f.id}">Cancel</button>
      </span>
    </li>`).join("")||"<li class='muted'>No reminders</li>",r=(c.plans||[]).map(f=>`<li>${e.esc(f.goal)}</li>`).join("")||"<li class='muted'>No open plans</li>";return`<div class="dashboard-grid">
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Goals</p>
            <h3 class="title-sm">Outcomes you own</h3>
            <p class="body-md muted">Track goals and reminders directly \u2014 no agent required.</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-primary button-sm" data-toggle-ui="goalsFormOpen">${m?"Hide goal form":"New goal"}</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="reminderFormOpen">${o?"Hide reminder":"Reminder"}</button>
          </div>
        </div>
        ${m?`
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
      <section class="driver-card span-6"><p class="caption-uppercase">Active goals</p><ul class="list-plain goal-list" style="margin-top:var(--space-sm)">${t}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Open tasks</p><ul class="list-plain" style="margin-top:var(--space-sm)">${a}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Reminders</p><ul class="list-plain" style="margin-top:var(--space-sm)">${d}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Plans &amp; projects</p><ul class="list-plain" style="margin-top:var(--space-sm)">${r}</ul></section>
    </div>`}async function k(c){let m=new FormData(c),o=(m.get("title")||"").toString().trim();if(o)try{await e.api("/goals",{method:"POST",body:JSON.stringify({title:o,detail:(m.get("detail")||"").toString().trim(),priority:parseInt(m.get("priority")||"3",10)||3})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.goalsFormOpen=!1),await e.refresh(),e.render(),c.reset()}catch(t){alert(t.message)}}async function b(c){if(c)try{await e.api(`/goals/${encodeURIComponent(c)}`,{method:"PATCH",body:JSON.stringify({status:"done"})}),e.state._goals=await e.api("/goals"),await e.refresh(),e.render()}catch(m){alert(m.message)}}async function s(c){let m=new FormData(c),o=(m.get("text")||"").toString().trim(),t=(m.get("due_at")||"").toString().trim();if(!o||!t)return;let a=t.length===16?`${t}:00`:t;try{await e.api("/reminders",{method:"POST",body:JSON.stringify({text:o,due_at:a})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.reminderFormOpen=!1),e.render(),c.reset()}catch(d){alert(d.message)}}async function g(c,m){if(await e.api(`/reminders/${c}`,{method:"PATCH",body:JSON.stringify({status:m}),timeoutMs:15e3}),e.state._goals=await e.api("/goals"),e.currentView==="goals"&&e.render(),e.currentView==="dashboard"){let o=e.currentWorldId(),t=o&&o!=="root"?`?world_id=${encodeURIComponent(o)}`:"";e.state._nudges=(await e.api(`/nudges${t}`).catch(()=>({nudges:[]}))).nudges||[],e.render()}}e.renderGoals=S,e.submitGoal=k,e.markGoalDone=b,e.submitReminder=s,e.updateReminderStatus=g}function Ae(e){function S(){let b=e.state._memoryResults||[],s=e.state._memoryFull||{},g=s.collections||[],c=s.knowledge_graph||{},m=b.map(t=>`<div class="memory-hit">
      <span class="badge-pill">${e.esc(t.collection)}</span>
      <p class="body-md" style="margin-top:var(--space-xxs);max-width:72ch">${e.esc(t.text)}</p></div>`).join(""),o=g.map(t=>`
      <div class="memory-collection">
        <h4>${e.esc(t.name)} <span class="muted">(${t.count} vectors)</span></h4>
        ${(t.samples||[]).map(a=>`<p class="memory-sample">${e.esc(a.text)}</p>`).join("")||"<p class='muted'>Empty collection</p>"}
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
        <p class="body-md" style="margin-bottom:var(--space-sm)">Knowledge graph (${(c.entities||[]).length} entities, ${(c.relations||[]).length} relations) plus recent vector memory chunks.</p>
        <div id="graph-memory" class="graph-canvas"></div>
        <div class="graph-detail" id="graph-memory-detail">Click a node to inspect</div>
      </div>
      <div id="memory-tab-collections" ${e.memoryGraphTab!=="collections"?"hidden":""}>${o||"<p class='body-md'>No vector memory yet.</p>"}</div>
      <div id="memory-tab-search" ${e.memoryGraphTab!=="search"?"hidden":""}>
        <div id="memory-results">${m||'<p class="body-md">Search to find relevant memories.</p>'}</div>
      </div>`}async function k(){let b=e.$("#memory-q")?.value?.trim();if(e.state._memoryQ=b,!b)return;let s=await e.api("/memory/search?q="+encodeURIComponent(b));e.state._memoryResults=s.results,e.render()}e.renderMemory=S,e.searchMemory=k}function Oe(e){function S(s){let g=s.content||"";return s.role==="agent"||s.role==="assistant"?`<div class="msg-md history-msg__body">${window.FOSMarkdown?.render?.(g)||e.esc(g)}</div>`:`<p class="body-md history-msg__body">${e.esc(g)}</p>`}function k(){let g=(e.state._history||{}).sessions||[],c=e.state._artifacts||[],m=e.state._historySession,o=e.historyTab,t=g.length?g.map(r=>`
      <button type="button" class="history-session${m?.id===r.id?" is-active":""}" data-history-session="${e.esc(r.id)}">
        <span class="history-session__title">${e.esc(r.title||"Conversation")}</span>
        <span class="history-session__meta muted">${e.esc(r.specialist||"supervisor")} \xB7 ${r.message_count||0} msgs \xB7 ${e.fmtHistoryTime(r.updated_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No conversations yet. Ask the agent something to start a session.</p>",a="<p class='body-md muted'>Select a conversation to view messages, runs, and linked documents.</p>";if(m?.messages?.length){let r=m.messages.map(A=>`
        <div class="history-msg history-msg--${e.esc(A.role)}">
          <span class="caption-uppercase">${e.esc(A.role)}</span>
          ${e.renderHistoryMessageContent(A)}
          <span class="muted" style="font-size:11px">${e.fmtHistoryTime(A.created_at)}</span>
        </div>`).join(""),f=(m.runs||[]).map(A=>`
        <article class="history-run">
          <div class="history-run__head">
            <span class="mono">${e.esc(A.specialist||A.actor||"agent")}</span>
            <span class="muted">${A.duration_s||0}s</span>
          </div>
          ${e.renderLiveFlow((A.tools||[]).map(y=>({name:y.name,decision:y.decision,t:y.t})),"No tools")}
          ${A.assistant_reply?`<div class="history-run__reply msg-md">${window.FOSMarkdown?.render?.(A.assistant_reply)||e.esc(A.assistant_reply)}</div>`:""}
        </article>`).join("")||"",R=(m.artifacts||[]).map(A=>`
        <button type="button" class="history-doc-btn" data-open-document="${A.id}">
          <span class="badge-pill">${e.esc(A.kind)}</span>
          <span>${e.esc(A.title)}</span>
        </button>`).join("")||"<p class='muted'>No documents in this session.</p>";a=`
        <div class="history-detail__actions">
          <button type="button" class="button-primary button-sm" data-open-chat-session="${e.esc(m.id)}">Open in chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New conversation</button>
        </div>
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Messages</p>
        <div class="history-messages">${r}</div>
        ${f?`<p class="caption-uppercase" style="margin-top:var(--space-md)">Runs</p>${f}`:""}
        <p class="caption-uppercase" style="margin-top:var(--space-md)">Documents</p>
        <div class="history-artifacts">${R}</div>`}let d=c.length?c.map(r=>`
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
        <section class="driver-card history-sessions">${t}</section>
        <section class="driver-card history-detail">${a}</section>
      </div>`:`<section class="driver-card history-documents-grid">${d}</section>`}`}async function b(s){e.state._historySelectedId=s;try{e.state._historySession=await e.api(`/history/sessions/${s}`)}catch{e.state._historySession=null}e.render()}e.renderHistoryMessageContent=S,e.renderHistory=k,e.loadHistorySession=b}function Le(e){function S(){let b=e.state.approvals||[];return b.length?`<section class="driver-card">${b.map(s=>`
      <div class="approval-block">
        <div class="approval-meta caption-uppercase"><span class="mono">#${s.id}</span> \xB7 ${e.esc(s.tool_name)}</div>
        <div class="approval-summary body-md">${e.esc(s.summary)}</div>
        <div class="approval-actions">
          <button type="button" class="button-primary button-sm" data-approve="${s.id}">Approve</button>
          <button type="button" class="button-outline-on-dark button-sm" data-reject="${s.id}">Reject</button>
        </div>
      </div>`).join("")}</section>`:'<section class="driver-card empty-state"><p class="title-sm">No pending approvals</p></section>'}async function k(b,s){try{let g=await e.api(`/approvals/${b}/${s?"approve":"reject"}`,{method:"POST"});e.chatHistory.push({role:"system",text:g.result}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.refresh(),e.currentView==="approvals"&&e.render()}catch(g){alert(g.message)}}e.renderApprovals=S,e.decideApproval=k}function Re(e){function S(){let k=e.state._tools||{},b=(k.tools||[]).map(s=>`<div class="tool-row">
      <div class="name">${e.esc(s.name)}${s.requires_approval?' <span class="badge-pill">approval</span>':""}</div>
      <div class="cat">${e.esc(s.category)}</div>
      <div class="desc">${e.esc(s.description)}</div></div>`).join("");return`<p class="body-md" style="margin-bottom:var(--space-xs);max-width:60ch">${k.total||0} tools \xB7 ${Object.keys(k.by_category||{}).length} categories. Tool-RAG retrieves the most relevant set per message.</p>
    <div class="tool-list">${b}</div>`}e.renderTools=S}function De(e){function S(){let k=e.state._activity?.traces_full||[],b=e.state._activity?.actions||e.state.actions||[],s=k.length?k.map(c=>`
      <article class="trace-card">
        <div class="trace-card-head">
          <span class="mono">${e.esc(c.actor)}</span>
          <span class="muted">${c.duration_s}s</span>
        </div>
        <p class="message">${e.esc(c.message)}</p>
        ${e.renderLiveFlow(c.events,"No tools in this turn")}
        ${c.final?`<p class="world-meta" style="margin-top:var(--space-xs)">\u2192 ${e.esc(c.final)}</p>`:""}
      </article>`).join(""):"<p class='body-md muted'>No agent turns logged today. Send a message in Chat to see the decision flow here.</p>",g=b.slice(0,20).map(c=>`<div class="activity-row">
      <div class="mono">${e.esc(c.tool_name)}</div>
      <div class="meta">${e.esc(c.actor)} \xB7 ${e.esc((c.created_at||"").slice(0,16))}</div></div>`).join("")||"<p class='muted'>No actions logged.</p>";return`<div class="dashboard-grid">
      <section class="driver-card span-8"><p class="caption-uppercase">Decision flow</p><div style="margin-top:var(--space-sm)">${s}</div></section>
      <section class="driver-card span-4"><p class="caption-uppercase">Tool log</p><div style="margin-top:var(--space-sm)">${g}</div></section>
    </div>`}e.renderActivity=S}function Te(e){function S(){let o=e.state._infraHealth;if(!o)return`<section class="driver-card span-12">
        <div class="infra-health-head">
          <p class="caption-uppercase">Infrastructure</p>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Check health</button>
        </div>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Monitor EC2 host, S3 vault bucket, and disk on this server.</p>
      </section>`;let t=o.host||{},a=o.s3||{},d=o.disk||{},r=o.app||{},f=t.platform==="ec2"?e.infraKvRow("Instance",t.instance_id,!0)+e.infraKvRow("Region",t.region)+e.infraKvRow("Type",t.instance_type)+e.infraKvRow("IAM role",t.iam_role):e.infraKvRow("Host","Local / dev"),R=a.configured?e.infraKvRow("Bucket",a.bucket,!0)+e.infraKvRow("Region",a.region)+e.infraKvRow("Read/write",a.read_write_ok?"OK":a.reachable?"Reachable only":"Failed"):e.infraKvRow("Storage","Local disk only"),A=e.infraKvRow("Data path",d.path,!0)+e.infraKvRow("Free",d.free_gb!=null?`${d.free_gb} GB`:null)+e.infraKvRow("Used",d.used_pct!=null?`${d.used_pct}%`:null),y=!!o.ok;return`<section class="driver-card span-12">
      <div class="infra-health-head">
        <div>
          <p class="caption-uppercase">Infrastructure</p>
          <p class="world-meta">Last checked ${e.esc(e.fmtTime(o.checked_at)||o.checked_at||"\u2014")} \xB7 App storage: <strong>${e.esc(r.storage_backend||"\u2014")}</strong></p>
        </div>
        <div class="infra-health-head__actions">
          <span class="badge-pill${y?" badge-pill--ok":" badge-pill--warn"}">${y?"All checks passed":"Needs attention"}</span>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Refresh</button>
        </div>
      </div>
      <div class="infra-health-grid">
        ${e.infraHealthCard("EC2 host",t.ok!==!1,f,t.detail)}
        ${e.infraHealthCard("S3 vault",a.configured?!!a.ok:!0,R,a.detail)}
        ${e.infraHealthCard("Disk",!!d.ok,A,d.detail)}
      </div>
    </section>`}function k(){let o=e.state.config||{},t=o.integrations||{},a=e.state._whatsapp||{},d=(o.autonomy_level||"balanced").toLowerCase(),r=o.whatsapp_enabled?a.connected?`Connected${a.linked_phone?` (${e.esc(a.linked_phone)})`:""}`:a.qr_pending?"Scan QR below":"Bridge not connected":"Disabled in .env",f=a.qr_data_url?`<img src="${a.qr_data_url}" alt="WhatsApp QR code" width="280" height="280" style="margin-top:var(--space-sm);border-radius:8px">`:"",R=o.agent_paused?'<button type="button" class="button-primary" id="toggle-pause">Resume agent</button>':'<button type="button" class="button-outline-on-dark" id="toggle-pause">Pause agent</button>';return`<div class="dashboard-grid settings-page">
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
                <option value="cautious"${d==="cautious"?" selected":""}>Cautious \u2014 ask before most actions</option>
                <option value="balanced"${d==="balanced"?" selected":""}>Balanced \u2014 routine tools auto-run</option>
                <option value="autonomous"${d==="autonomous"?" selected":""}>Autonomous \u2014 minimal prompts</option>
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
          ${e.integrationCard("Gmail",t.gmail,"SMTP send + IMAP inbox via app password")}
          ${e.integrationCard("Google Calendar",t.calendar,"OAuth token in data/google_token.json")}
          ${e.integrationCard("Qdrant",t.qdrant,"Vector memory + knowledge vault")}
          ${e.integrationCard("X / Twitter",t.x,"Posting and monitoring API keys")}
          ${e.integrationCard("Serper",t.serper,"Web search")}
          ${e.integrationCard("Tavily",t.tavily,"Research search")}
          ${e.integrationCard("GitHub",t.github||t.github_oauth,t.github?"Connected \u2014 link repos in Worlds":t.github_oauth?"OAuth ready \u2014 connect in Worlds":"Set GITHUB_CLIENT_ID in .env")}
          ${e.integrationCard("WhatsApp",t.whatsapp&&a.connected,"Allowlisted CRM contacts only; every send needs approval")}
        </div>
      </section>
      ${o.whatsapp_enabled?`<section class="driver-card span-12 human-panel" id="whatsapp-settings-panel">
        <p class="section-eyebrow">WhatsApp</p>
        <h3 class="title-sm">Linked device</h3>
        <p class="body-md muted">Personal WhatsApp via Baileys (unofficial). Only contacts you allow in CRM are stored or messaged. Outbound always requires your approval.</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Status</dt><dd>${r}</dd></div>
          <div class="settings-kv__row"><dt>Allowlisted</dt><dd>${a.allowlist_count??a.allowlist_size??"\u2014"} contacts</dd></div>
        </dl>
        ${f}
        <p class="caption muted" style="margin-top:var(--space-xs)">Open WhatsApp \u2192 Linked devices \u2192 Link a device. QR refreshes every few seconds while pending.</p>
      </section>`:""}
    </div>`}function b(){e.whatsappPollTimer&&(clearInterval(e.whatsappPollTimer),e.whatsappPollTimer=null)}async function s(){if(e.currentView!=="settings"){e.stopWhatsappPoll();return}try{let o=await e.api("/whatsapp/status");if(e.state._whatsapp={...e.state._whatsapp||{},...o},o.qr_pending){let t=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=t.qr_data_url||null}else e.state._whatsapp.qr_data_url=null;e.currentView==="settings"&&e.render({graphs:!1})}catch{}}function g(){e.stopWhatsappPoll();let o=e.state.config||{};e.currentView!=="settings"||!o.whatsapp_enabled||(e.pollWhatsappSettings(),e.whatsappPollTimer=setInterval(s,5e3))}async function c(){let o=document.getElementById("btn-infra-refresh");o&&(o.disabled=!0);try{e.state._infraHealth=await e.api("/infrastructure/health"),e.render(),e.afterRender()}catch(t){console.error("Infrastructure health check failed:",t)}finally{o&&(o.disabled=!1)}}async function m(o){let t=new FormData(o);try{let a=await e.api("/agent/config",{method:"POST",body:JSON.stringify({autonomy_level:(t.get("autonomy_level")||"balanced").toString(),auto_approve:t.get("auto_approve")==="1"})});e.state.config={...e.state.config||{},...a},e.updateStatus(),e.render()}catch(a){alert(a.message)}}e.renderInfrastructureHealth=S,e.renderSettings=k,e.stopWhatsappPoll=b,e.pollWhatsappSettings=s,e.startWhatsappPollIfNeeded=g,e.refreshInfraHealth=c,e.saveAgentConfig=m}function Pe(e){function S(y){let w={name:"",dirs:{},files:[]};for(let O of y){let D=O.github_path||O.filename||O.title||"file",G=D.split("/").filter(Boolean),q=G.pop()||D,K=w;for(let Q of G)K.dirs[Q]||(K.dirs[Q]={name:Q,dirs:{},files:[]}),K=K.dirs[Q];K.files.push({...O,_fileName:q})}return w}function k(){return document.hidden?e.LIVE_POLL_HIDDEN_MS:e.LIVE_POLL_MS}function b(){e.livePollTimer&&clearTimeout(e.livePollTimer),e.livePollTimer=setTimeout(async()=>{await e.pollLive(),e.scheduleLivePoll()},e.livePollDelayMs())}function s(y){return e.WORLD_KINDS[y]||e.WORLD_KINDS.project}function g(y){let w=e.worldKindMeta(y||"project");return`<span class="world-kind-badge ${w.cls}">${e.esc(w.label)}</span>`}function c(){return e.state._worldFull?.worlds||e.state.worlds||{}}function m(y){e.currentView==="world"&&e.inspectorWorldId()===y?e.patchWorldPanels():e.currentView==="agents"&&e.currentWorldId()===y?e.patchAgentsVaultPanel():e.render({graphs:!1})}function o(){return(e.state._worldVault?.storage_backend||e.state._worldVault?.vault?.storage_backend)==="s3"?"S3":"local object storage"}function t(y){let w=Number(y)||0;return w<1024?`${w} B`:w<1048576?`${(w/1024).toFixed(1)} KB`:`${(w/1048576).toFixed(1)} MB`}function a(y){if(!y)return"";let w=typeof y=="number"?new Date(y*1e3):new Date(y);return Number.isNaN(w.getTime())?String(y).slice(0,16):w.toLocaleString()}function d(y,w,O=!1){let D=w==null||w===""?"\u2014":String(w);return`<div class="infra-kv"><dt>${e.esc(y)}</dt><dd${O?' class="infra-kv__val"':""}>${e.esc(D)}</dd></div>`}function r(y,w,O,D){let G=w?"Healthy":"Issue";return`<div class="integration-card infra-health-card${w?" is-connected":" is-warning"}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(y)}</span>
        <span class="integration-card__status">${G}</span>
      </div>
      <dl class="infra-kv-list">${O}</dl>
      ${D?`<p class="integration-card__detail">${e.esc(D)}</p>`:""}
    </div>`}function f(y,w,O){return`<div class="integration-card${w?" is-connected":""}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(y)}</span>
        <span class="integration-card__status">${w?"Active":"Not configured"}</span>
      </div>
      <p class="integration-card__detail">${e.esc(O)}</p>
    </div>`}async function R(y){let w=y.target.files?.[0];if(!w)return;let O=new FormData;O.append("file",w),e.chatHistory.push({role:"user",text:`\u{1F4CE} Uploaded: ${w.name}`}),e.render();try{O.append("world_id",e.currentWorldId());let D=await fetch("/api/upload",{method:"POST",body:O,credentials:"same-origin"}),G=await D.json().catch(()=>({}));if(D.status===401&&G.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!D.ok)throw new Error(G.error||D.statusText);e.chatHistory.push({role:"agent",text:G.reply})}catch(D){e.chatHistory.push({role:"system",text:"Upload failed: "+D.message})}localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),y.target.value="",e.render()}function A(){let y=document.querySelector(".app"),w=e.$("#btn-sidebar-collapse"),O="fos_sidebar_collapsed";localStorage.getItem(O)==="1"&&y?.classList.add("sidebar-collapsed");let D=()=>{let G=y?.classList.contains("sidebar-collapsed");w?.setAttribute("aria-label",G?"Expand sidebar":"Collapse sidebar"),w?.setAttribute("title",G?"Expand sidebar":"Collapse sidebar")};D(),w?.addEventListener("click",()=>{y?.classList.toggle("sidebar-collapsed"),localStorage.setItem(O,y?.classList.contains("sidebar-collapsed")?"1":"0"),D()})}e.buildGithubPathTree=S,e.livePollDelayMs=k,e.scheduleLivePoll=b,e.worldKindMeta=s,e.worldKindBadge=g,e.worldTreeData=c,e.afterVaultMutation=m,e.vaultStorageLabel=o,e.formatBytes=t,e.fmtHistoryTime=a,e.infraKvRow=d,e.infraHealthCard=r,e.integrationCard=f,e.uploadFile=R,e.initSidebarCollapse=A}function Ee(e){async function S(g){if(g==="crm"&&await e.loadCrmData(),g==="outreach"&&await e.loadOutreachData(),g==="settings"&&(e.state._whatsapp=await e.api("/whatsapp/status").catch(()=>({})),e.state._whatsapp.qr_pending)){let c=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=c.qr_data_url||null}if(g==="goals"&&(e.state._goals=await e.api("/goals")),g==="tools"&&(e.state._tools=await e.api("/tools")),g==="agents"){let[c,m,o,t,a]=await Promise.all([e.api("/agents"),e.api("/activity").catch(()=>({})),e.api("/agents/runs").catch(()=>({runs:[],actions:[]})),e.api("/crm/contacts").catch(()=>({})),e.api("/tools").catch(()=>({}))]);e.state._agents=c,e.state._agents?.specialists?.length||(e.state._agents={...e.state._agents,specialists:e.DEFAULT_SPECIALISTS}),e.state._activity=m,e.state._agentRunsApi=o.runs||[],e.state._agentActions=o.actions||m.actions||[],e.state._crm=t,e.state._tools=a;let d=e.currentWorldId();d&&d!=="root"?await e.ensureVaultForWorld(d):e.clearVaultScopedState()}if(g==="settings"&&(e.state._infraHealth=await e.api("/infrastructure/health").catch(()=>e.state._infraHealth||null)),g==="activity"&&(e.state._activity=await e.api("/activity")),g==="history"){let c=e.currentWorldId(),m=c&&c!=="root"?`?world_id=${encodeURIComponent(c)}`:"";e.state._history=await e.api(`/history${m}`).catch(()=>({sessions:[],recent_runs:[]})),e.state._artifacts=(await e.api(`/artifacts${m}`).catch(()=>({artifacts:[]}))).artifacts||[],e.state._historySelectedId?e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null):e.state._history.sessions?.[0]&&(e.state._historySelectedId=e.state._history.sessions[0].id,e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null))}if(g==="documents")if(e.state._artifacts=(await e.api("/artifacts?limit=100").catch(()=>({artifacts:[]}))).artifacts||[],e.state._documentsSelectedId)try{let c=await e.api(`/artifacts/${e.state._documentsSelectedId}/content`,{timeoutMs:15e3});e.state._documentDraft=c.content||""}catch{e.state._documentDraft=""}else e.state._documentDraft="";if(g==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldGraph=e.state._worldFull?.graph??null,e.state._worldHierarchyGraph=e.state._worldFull?.hierarchy_graph??null,e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.invalidateGraphCache("graph-world"),e.state._worldTemplates?.length||(e.state._worldTemplates=(await e.api("/world-templates").catch(()=>({}))).templates||[]),e.state.inspectorWorldId||(e.state.inspectorWorldId=e.currentWorldId()),e.state._githubStatus=await e.api("/github/status").catch(()=>({})),e.state._githubStatus?.connected?e.state._githubRepos=(await e.api("/github/repos").catch(()=>({}))).repos||[]:e.state._githubRepos=[],await e.ensureVaultForWorld(e.inspectorWorldId()),await e.resumeActiveSyncJobs(e.inspectorWorldId())),g==="memory"&&(e.state._memoryFull=await e.api("/graph/memory"),e.state._memoryGraph=e.state._memoryFull?.graph??null,e.invalidateGraphCache("graph-memory")),(g==="dashboard"||g==="chat"||g==="agents")&&(e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})))),g==="chat"){e.state._activity=await e.api("/activity").catch(()=>e.state._activity||{}),e.state._agentRunsApi=(await e.api("/agents/runs").catch(()=>({}))).runs||e.state._agentRunsApi,await e.loadChatSessionsList(),await e.loadChatFromServer();let c=e.currentWorldId();c&&c!=="root"&&await e.ensureVaultForWorld(c)}if(g==="dashboard"){e.state._world=await e.api("/world").catch(()=>e.state._world||{}),e.state._worldGraph=e.state._world?.graph??e.state._worldGraph??null,e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})));let c=e.currentWorldId(),m=c&&c!=="root"?`?world_id=${encodeURIComponent(c)}`:"";e.state._nudges=(await e.api(`/nudges${m}`).catch(()=>({nudges:[]}))).nudges||[]}["dashboard","agents","chat","world","memory"].includes(g)&&await e.loadGraphData()}async function k(g=!1){let c=e.state.activeWorldId,m=e.state.selectedSpecialist,o=e.state.ui;if(g||!e.state.config?.my_name)e.state={...e.state,...await e.api("/state")};else{let t=await e.api("/summary");e.state.usage=t.usage??e.state.usage,e.state.unread_notifications=t.unread_notifications??e.state.unread_notifications,t.worlds&&(e.state.worlds=t.worlds),t.config&&(e.state.config=t.config),e.state.snapshot={...e.state.snapshot||{},approvals_pending:t.approvals_pending??e.state.snapshot?.approvals_pending??0,reminders_pending:t.reminders_pending??e.state.snapshot?.reminders_pending??0,tasks_open:t.tasks_open??e.state.snapshot?.tasks_open??0,crm:{...e.state.snapshot?.crm||{},followups_due:t.crm_followups_due??e.state.snapshot?.crm?.followups_due??0}}}e.state.activeWorldId=c||e.state.activeWorldId||"root",e.state.selectedSpecialist=m??e.state.selectedSpecialist??"",e.state.ui=o||e.state.ui;try{e.populateWorldSelect(),e.populateSpecialistSelect()}catch(t){console.error("populate selects failed:",t)}e.updateBadges(),e.updateStatus(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function b(){}function s(){e.refreshTimer&&clearTimeout(e.refreshTimer),!document.hidden&&(e.refreshTimer=setTimeout(async()=>{try{await e.refresh(!1),e.updateBadges(),e.updateStatus()}catch(g){console.error(g),e.setConnectionStatus("Reconnecting\u2026","paused")}e.scheduleBackgroundRefresh()},e.REFRESH_MS))}e.loadViewData=S,e.refresh=k,e.loadBootExtras=b,e.scheduleBackgroundRefresh=s}function We(e){function S(){return window.FOS_MOBILE_PRIMARY_VIEWS||new Set(["dashboard","chat","agents","world"])}function k(){document.getElementById("sidebar")?.classList.remove("is-open"),document.body.classList.remove("mobile-nav-open");let r=document.getElementById("sidebar-backdrop");r&&(r.classList.remove("is-visible"),r.setAttribute("hidden","")),document.getElementById("mobile-menu-drawer")?.close?.()}function b(){let r=document.getElementById("sidebar"),f=document.getElementById("sidebar-backdrop");!r||!f||(r.classList.add("is-open"),document.body.classList.add("mobile-nav-open"),f.removeAttribute("hidden"),requestAnimationFrame(()=>f.classList.add("is-visible")))}function s(r){let f=e.mobilePrimaryViews();document.querySelectorAll(".mobile-tab").forEach(R=>{let A=R.dataset.mobileView;A==="more"?R.classList.toggle("is-active",!f.has(r)):R.classList.toggle("is-active",A===r)}),document.querySelectorAll(".mobile-menu-link").forEach(R=>{R.classList.toggle("is-active",R.dataset.view===r)})}function g(r,f={}){let R=f.params??(r===e.currentView?e.routeParams:{})??{};f.skipUrl?e.applyRouteParams(r,R):e.updateRoute(r,R,{replace:!!f.replace}),e.currentView=r,r!=="outreach"&&e.state._crmOutreachPollId&&(clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null),e.$$(".nav button").forEach(y=>y.classList.toggle("is-active",y.dataset.view===r)),e.$("#view-title").textContent=e.TITLES[r]||r,e.syncMobileNav(r),e.closeMobileShell(),FOSMotion?.animateTopbarTitle?.(),["dashboard","agents","chat","activity","world"].includes(r)?e.startLivePoll():e.stopLivePoll();let A=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1}),e.loadViewData(r).then(()=>{A===e.viewDataLoadGen&&(e.setViewLoading(!1),e.render())}).catch(y=>{console.error(y),A===e.viewDataLoadGen&&e.setViewLoading(!1)})}function c(r={}){try{e.currentView==="dashboard"&&e.drawDashboardCharts()}catch(y){console.warn("dashboard charts skipped:",y)}try{r.graphs!==!1&&e.drawGraphs()}catch(y){console.warn("graphs skipped:",y)}e.state._motionSkipOnce?e.state._motionSkipOnce=!1:FOSMotion?.runView?.(e.currentView),FOSMotion?.ensureContentVisible?.();let f=document.getElementById("content"),R=window.FOSMarkdown?.enhance?.(f),A=()=>{(e.currentView==="chat"||e.currentView==="agents")&&e.initMsgReadMore(f)};if(R?.then?R.then(A).catch(A):A(),e.currentView==="documents"&&!e.documentsEditMode){let y=e.$("#docs-preview");y&&window.FOSMarkdown?.renderInto?.(y,e.state._documentDraft??"")}e.startWhatsappPollIfNeeded(),e.currentView==="outreach"&&e.outreachStep?.()==="setup"&&(e.syncOutreachCompanyPickerUi?.(),e.fitAllOutreachTextareas?.()),e.currentView==="outreach"&&e.outreachStep?.()==="review"&&e.fitAllOutreachTextareas?.()}function m(){let r=(e.state.approvals||[]).length,f=e.$("#nav-approval-badge");f&&(f.textContent=r,f.hidden=!r);let R=e.$("#mobile-approval-badge");R&&(R.textContent=r,R.hidden=!r);let A=e.$("#mobile-menu-approval-badge");A&&(A.textContent=r,A.hidden=!r);let y=e.state.unread_notifications||0,w=e.$("#notif-badge");w&&(w.textContent=y,w.hidden=!y)}function o(r,f="ok"){let R=e.$("#status-dot"),A=e.$("#status-text"),y=e.$("#mobile-status-dot"),w=e.$("#mobile-status-text");A&&(A.textContent=r),w&&(w.textContent=r),R?.classList.toggle("ok",f==="ok"),R?.classList.toggle("paused",f!=="ok"),y?.classList.toggle("ok",f==="ok"),y?.classList.toggle("paused",f!=="ok")}function t(){let r=e.state.config||{};r.agent_paused?e.setConnectionStatus("Agent paused","paused"):e.setConnectionStatus("Online","ok");let f=e.$("#brand-sub");f&&(f.textContent=r.my_name||r.company_name||e.APP_NAME),document.title=r.my_name?`${e.APP_NAME} \u2014 ${r.my_name}`:e.APP_NAME}async function a(r,f){f&&(await e.api(`/notifications/${encodeURIComponent(f)}/read`,{method:"POST"}).catch(()=>{}),await e.refresh(),e.updateBadges()),r==="approvals"?e.goView("approvals"):r==="crm"?e.goView("crm"):r==="outreach"?e.goView("outreach"):r==="goals"?e.goView("goals"):r==="chat"?e.goView("chat"):e.goView(r||"dashboard"),e.$("#notif-drawer")?.close()}function d(){let r=e.state.notifications||[];e.$("#notif-list").innerHTML=r.length?r.map(f=>{let R=f.meta?.action||(f.kind==="approval"?"approvals":f.kind==="agent"?"chat":""),A=R?`<button type="button" class="button-outline-on-dark button-sm" data-notif-action="${e.esc(R)}" data-notif-id="${e.esc(f.id)}" style="margin-top:8px">Open</button>`:"",y=f.meta?.url,w=!A&&y?`<a class="button-outline-on-dark button-sm" href="${e.esc(y)}" target="_blank" rel="noopener" style="margin-top:8px;display:inline-block">Open</a>`:"";return`
      <div class="notif-item ${f.read?"":"unread"}" data-notif-id="${e.esc(f.id)}">
        <div class="title">${e.esc(f.title)}</div>
        <div class="body">${e.esc(f.body)}</div>
        <div class="muted" style="font-size:11px;margin-top:4px">${e.fmtTime(f.ts)}</div>
        ${A||w}
      </div>`}).join(""):"<p class='muted'>No notifications yet.</p>"}e.mobilePrimaryViews=S,e.closeMobileShell=k,e.openSidebar=b,e.syncMobileNav=s,e.goView=g,e.afterRender=c,e.updateBadges=m,e.setConnectionStatus=o,e.updateStatus=t,e.openNotificationAction=a,e.renderNotifications=d}function Me(e){function S(){let k=document.getElementById("content");!k||k.dataset.delegation==="1"||(k.dataset.delegation="1",k.addEventListener("click",b=>{let s=b.target.closest("[data-operator],[data-toggle-ui],[data-goto],[data-approve],[data-reject],[data-select-specialist],[data-agents-tab],[data-toggle-run],[data-memory-tab],[data-inspect-world],[data-world-graph-tab],[data-use-world],[data-set-active-world],[data-edit-world],[data-cancel-edit],[data-delete-world],[data-vault-ingest],[data-vault-link],[data-vault-search],[data-vault-facet],[data-vault-add-doc],[data-vault-cancel-doc],[data-vault-edit-doc],[data-vault-delete-doc],[data-vault-view-doc],[data-vault-reload],[data-github-add],[data-github-sync],[data-github-unlink],[data-goal-done],[data-history-tab],[data-history-session],[data-open-chat-session],[data-new-chat-session],[data-chat-session],[data-cancel-job],[data-cancel-active-job],[data-md-artifact],[data-open-document],[data-select-document],[data-docs-action],[data-tag-vault-doc],[data-nudge-index],[data-remove-attachment],[data-open-vault-picker],[data-pick-vault-doc],[data-crm-followup],[data-crm-wa-thread],[data-crm-tab],[data-crm-company-detail],[data-crm-company-close],[data-crm-import-companies],[data-crm-reload],[data-crm-outreach-start],[data-crm-campaign],[data-crm-draft-approve],[data-crm-draft-skip],[data-crm-company-toggle],[data-crm-skip-company],[data-crm-outreach-refresh],[data-crm-outreach-back],[data-outreach-open-crm-companies],[data-outreach-save-companies],[data-msg-read-more],#chat-send,#chat-clear,#memory-search,#toggle-pause,#agents-vault-search,#delegate-selected-btn,#btn-logout,#btn-infra-refresh");if(!s)return;let g=()=>{if(s.dataset.msgReadMore){e.state._msgExpand||(e.state._msgExpand={});let c=s.dataset.msgReadMore;e.state._msgExpand[c]=(e.state._msgExpand[c]||0)+1,e.initMsgReadMore(s.closest(".msg-read-more-host")||k);return}if(s.id==="chat-send")return e.sendChat();if(s.id==="chat-clear")return e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.setChatSessionId(null),e.render();if(s.id==="memory-search")return e.searchMemory();if(s.id==="toggle-pause")return e.togglePause();if(s.id==="agents-vault-search")return e.agentsVaultSearch();if(s.id==="delegate-selected-btn")return e.delegateAgent();if(s.id==="btn-logout")return e.logoutPin();if(s.id==="btn-infra-refresh")return e.refreshInfraHealth();if(s.dataset.operator)return e.openOperatorAction(s.dataset.operator);if(s.dataset.toggleUi)return e.state.ui||(e.state.ui={}),e.state.ui[s.dataset.toggleUi]=!e.state.ui[s.dataset.toggleUi],e.render();if(s.dataset.goto)return e.goView(s.dataset.goto);if(s.dataset.approve)return e.decideApproval(s.dataset.approve,!0);if(s.dataset.reject)return e.decideApproval(s.dataset.reject,!1);if(s.dataset.selectSpecialist!==void 0)return e.selectSpecialist(s.dataset.selectSpecialist||"");if(s.dataset.agentsTab){e.state.agentsTab=s.dataset.agentsTab,localStorage.setItem("fos_agents_tab",e.state.agentsTab),e.render(),e.state.agentsTab==="vault"?e.onWorldContextChanged({vaultWorldId:e.currentWorldId(),forceVault:!1}).then(()=>e.patchAgentsVaultPanel()):e.drawGraphs();return}if(s.dataset.toggleRun){let c=s.dataset.toggleRun;return e.state.expandedRunId=e.state.expandedRunId===c?null:c,e.render()}if(s.dataset.memoryTab)return e.memoryGraphTab=s.dataset.memoryTab,e.render({graphs:!1});if(s.dataset.inspectWorld)return e.selectInspectorWorld(s.dataset.inspectWorld);if(s.dataset.worldGraphTab)return e.switchWorldGraphTab(s.dataset.worldGraphTab);if(s.dataset.useWorld)return e.setActiveWorld(s.dataset.useWorld),e.goView("chat");if(s.dataset.setActiveWorld)return e.setActiveWorld(s.dataset.setActiveWorld),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.onWorldContextChanged({vaultWorldId:s.dataset.setActiveWorld,forceVault:!0}).then(()=>e.currentView==="world"?e.patchWorldPanels():e.render({graphs:!1}));if(s.dataset.editWorld)return e.state.worldEditing=s.dataset.editWorld,e.render();if(s.dataset.cancelEdit!==void 0)return e.state.worldEditing=null,e.render();if(s.dataset.deleteWorld)return e.deleteWorld(s.dataset.deleteWorld);if(s.dataset.vaultIngest)return e.vaultIngest(s.dataset.vaultIngest);if(s.dataset.vaultLink)return e.vaultLinkRepo(s.dataset.vaultLink);if(s.dataset.vaultSearch)return e.vaultSearch(s.dataset.vaultSearch);if(s.dataset.vaultReload)return e.reloadVaultFromServer(s.dataset.vaultReload);if(s.dataset.vaultFacet)return e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=s.dataset.vaultFacet,e.patchWorldPanels();if(s.dataset.vaultAddDoc!==void 0)return e.state.ui||(e.state.ui={}),e.state.ui.vaultDocForm=!0,e.state.ui.vaultDocEdit=null,e.patchWorldPanels();if(s.dataset.vaultCancelDoc!==void 0)return e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),e.patchWorldPanels();if(s.dataset.vaultEditDoc)return e.startVaultDocEdit(e.inspectorWorldId(),s.dataset.vaultEditDoc);if(s.dataset.vaultViewDoc){let c=s.dataset.worldId||e.inspectorWorldId(),m=s.dataset.vaultViewDoc;return m?e.openVaultDocViewer(c,m,s.dataset.docTitle||"Document"):void 0}if(s.dataset.tagVaultDoc)return e.tagVaultDocInChat(s.dataset.tagVaultDoc,s.dataset.worldId,s.dataset.docTitle,s.dataset.docPath);if(s.dataset.nudgeIndex!==void 0)return e.handleNudgeAction(s.dataset.nudgeIndex);if(s.dataset.removeAttachment!==void 0){let c=Number(s.dataset.removeAttachment);return Number.isNaN(c)||e.state._chatAttachments?.splice(c,1),e.render()}if(s.dataset.openVaultPicker!==void 0)return e.openVaultAttachPicker().catch(c=>alert(c.message));if(s.dataset.pickVaultDoc){e.tagVaultDocInChat(s.dataset.pickVaultDoc,s.dataset.worldId,s.dataset.docTitle,s.dataset.docPath),e.$("#vault-picker-dialog")?.close();return}if(s.dataset.crmTab)return e.state.ui||(e.state.ui={}),e.state.ui.crmTab=s.dataset.crmTab,localStorage.setItem("fos_crm_tab",e.state.ui.crmTab),e.loadCrmData().then(()=>e.render());if(s.dataset.crmOutreachRefresh!==void 0){let c=e.state.ui?.crmCampaignId;return c?e.pollCrmOutreachJob(c,!0):e.loadOutreachData().then(()=>e.render())}if(s.hasAttribute("data-outreach-save-companies"))return e.saveOutreachCompanySelection();if(s.hasAttribute("data-outreach-open-crm-companies"))return e.state.ui||(e.state.ui={}),e.state.ui.crmTab="companies",localStorage.setItem("fos_crm_tab","companies"),e.goView("crm");if(s.dataset.crmCompanyDetail)return e.openCrmCompanyDetail(s.dataset.crmCompanyDetail);if(s.dataset.crmCompanyClose!==void 0)return e.state.ui&&(e.state.ui.crmCompanyDetail=null),e.state._crmCompanyDetail=null,e.render();if(s.dataset.crmImportCompanies!==void 0)return e.importCrmCompaniesFromContacts();if(s.dataset.crmReload!==void 0)return e.loadCrmData().then(()=>e.render());if(s.dataset.crmFollowup)return e.scheduleCrmFollowup(s.dataset.crmFollowup,s.dataset.followupDays);if(s.dataset.crmWaThread)return e.loadCrmWaThread(s.dataset.crmWaThread);if(s.dataset.crmCampaign)return e.openCrmCampaignReview(s.dataset.crmCampaign);if(s.hasAttribute("data-crm-outreach-back"))return e.closeCrmCampaignReview();if(s.dataset.crmDraftApprove)return e.runWithActionBusy(()=>e.approveCrmDraft(s.dataset.crmDraftApprove),s);if(s.dataset.crmDraftSkip)return e.runWithActionBusy(()=>e.skipCrmDraft(s.dataset.crmDraftSkip),s);if(s.dataset.crmSkipCompany)return confirm("Skip all pending messages for this company?")?e.runWithActionBusy(()=>e.skipCrmCompany(s.dataset.crmSkipCompany),s):void 0;if(s.dataset.reminderDone)return e.updateReminderStatus(s.dataset.reminderDone,"done");if(s.dataset.reminderCancel)return e.updateReminderStatus(s.dataset.reminderCancel,"cancelled");if(s.dataset.notifAction)return e.openNotificationAction(s.dataset.notifAction,s.dataset.notifId);if(s.dataset.vaultDeleteDoc)return e.deleteVaultDoc(e.inspectorWorldId(),s.dataset.vaultDeleteDoc);if(s.dataset.githubAdd)return e.connectGithubRepo(s.dataset.githubAdd);if(s.dataset.githubSync)return e.syncGithubRepo(s.dataset.worldId,s.dataset.githubSync);if(s.dataset.githubUnlink)return e.unlinkGithubRepo(s.dataset.worldId,s.dataset.githubUnlink);if(s.dataset.goalDone)return e.markGoalDone(s.dataset.goalDone);if(s.dataset.historyTab)return e.historyTab=s.dataset.historyTab,localStorage.setItem("fos_history_tab",e.historyTab),e.render();if(s.dataset.historySession)return e.loadHistorySession(s.dataset.historySession);if(s.dataset.openChatSession)return e.setChatSessionId(s.dataset.openChatSession),e.loadChatFromServer().then(()=>e.goView("chat"));if(s.hasAttribute("data-new-chat-session"))return e.setChatSessionId(null),e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.loadChatSessionsList().then(()=>{e.currentView==="chat"?e.render():e.goView("chat")});if(s.dataset.chatSession)return e.setChatSessionId(s.dataset.chatSession),e.loadChatFromServer().then(()=>e.render());if(s.dataset.cancelJob)return e.cancelActiveJob(s.dataset.cancelJob);if(s.dataset.cancelActiveJob!==void 0)return e.cancelActiveJob();if(s.dataset.openDocument)return e.openDocumentsWorkspace(Number(s.dataset.openDocument));if(s.dataset.mdArtifact)return e.openDocumentsWorkspace(Number(s.dataset.mdArtifact));if(s.dataset.selectDocument)return e.selectDocument(s.dataset.selectDocument);if(s.dataset.docsAction){let c=s.dataset.docsAction;if(c==="new")return e.createNewDocument().catch(m=>alert(m.message));if(c==="toggle")return e.documentsEditMode&&(e.state._documentDraft=document.getElementById("docs-source")?.value??e.state._documentDraft),e.documentsEditMode=!e.documentsEditMode,e.render();if(c==="save")return e.saveCurrentDocument().catch(m=>alert(m.message));if(c==="memory")return e.saveDocumentToMemory().catch(m=>alert(m.message))}};return e.shouldSkipActionBusy(s)?g():e.runWithActionBusy(g,s)}),k.addEventListener("submit",b=>{let s=b.target;if(!(s instanceof HTMLFormElement))return;let g={"world-create-form":e.createWorldFromForm,"crm-create-form":e.submitCrmContact,"crm-company-form":e.submitCrmCompany,"crm-outreach-form":e.submitCrmOutreach,"goal-create-form":e.submitGoal,"reminder-create-form":e.submitReminder,"agent-config-form":e.saveAgentConfig,"world-edit-form":e.saveWorldEdit,"vault-doc-form":e.submitVaultDoc};if(g[s.id]){b.preventDefault();let c=s.querySelector('[type="submit"]');e.runWithActionBusy(()=>g[s.id](s),c)}}),k.addEventListener("change",b=>{if(b.target.id==="chat-file")return e.uploadFile(b);if(b.target.id==="docs-upload"){let s=b.target.files?.[0];s&&e.uploadDocumentFile(s).catch(g=>alert(g.message)),b.target.value="";return}if(b.target.id==="specialist-select-agents"||b.target.id==="chat-specialist-select")return e.selectSpecialist(b.target.value);if(b.target.id==="rag-mode-select"){e.state.ragMode=b.target.value||"auto",localStorage.setItem("fos_rag_mode",e.state.ragMode);return}b.target.matches("[data-crm-status]")&&e.updateCrmStatus(b.target.dataset.crmStatus,b.target.value),b.target.matches("[data-crm-whatsapp]")&&e.updateCrmWhatsapp(b.target.dataset.crmWhatsapp,b.target.checked),b.target.matches("[data-crm-company-toggle]")&&e.toggleOutreachDraftCompany(b.target),b.target.id==="crm-outreach-batch"&&e.setOutreachBatchSize(b.target.value),b.target.id==="crm-outreach-world"&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld=b.target.value,e.restoreOutreachSelectionForWorld(b.target.value),e.loadOutreachData().then(()=>e.render()))}),k.addEventListener("blur",b=>{if(b.target.matches(".crm-draft-subject, .crm-draft-body")){let s=b.target.dataset.draftId;s&&e.saveCrmDraftEdits(s).catch(()=>{})}},!0),k.addEventListener("keydown",b=>{b.target.id==="chat-input"&&b.key==="Enter"&&!b.shiftKey&&(b.preventDefault(),e.sendChat()),b.target.id==="memory-q"&&b.key==="Enter"&&e.searchMemory()}),k.addEventListener("input",b=>{if(b.target.id==="outreach-company-search"&&e.filterOutreachCompanyList(b.target.value),b.target.matches(".crm-draft-body--fit, .outreach-auto-textarea")&&e.fitOutreachTextarea?.(b.target),b.target.matches(".crm-draft-body[data-channel='whatsapp']")){let s=b.target.dataset.draftId,g=document.querySelector(`.crm-wa-count[data-draft-id="${s}"]`);g&&(g.textContent=`${b.target.value.length}/300`)}b.target.id==="delegate-selected"&&(e.state._delegateDraft=b.target.value)}))}e.initContentDelegation=S}function Ve(e){function S(s="rag-mode-select"){let g=e.RAG_MODES.map(c=>`<option value="${e.esc(c.id)}" title="${e.esc(c.hint)}">${e.esc(c.label)}</option>`).join("");return`<label class="chat-control">
      <span class="caption-uppercase">Retrieval</span>
      <select id="${e.esc(s)}" class="world-select agent-select" aria-label="RAG mode">${g}</select>
    </label>`}function k(){requestAnimationFrame(()=>{let s=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),g=s?.[s.length-1];FOSMotion?.animateNewMessage?.(g)})}function b(s={}){let g=e.$("#content");if(!g)return;let c={dashboard:e.renderDashboard,chat:e.renderChat,agents:e.renderAgents,world:e.renderWorld,approvals:e.renderApprovals,crm:e.renderCrm,outreach:e.renderOutreach,goals:e.renderGoals,memory:e.renderMemory,history:e.renderHistory,documents:e.renderDocuments,tools:e.renderTools,activity:e.renderActivity,settings:e.renderSettings};try{if(e.state._viewLoading)g.innerHTML=e.renderViewSkeleton(e.currentView);else{let o=c[e.currentView]||e.renderDashboard;g.innerHTML=o()}}catch(o){console.error("render failed:",o),g.innerHTML=`<div class="driver-card span-12">
        <p class="title-md">Dashboard could not render</p>
        <p class="body-md muted" style="margin-top:8px">${e.esc(o?.message||String(o))}</p>
        <button type="button" class="button-primary button-sm" id="render-retry" style="margin-top:12px">Retry</button>
      </div>`,e.$("#render-retry")?.addEventListener("click",()=>e.boot());return}document.querySelector(".content")?.classList.toggle("content--worlds",e.currentView==="world"),document.querySelector(".content")?.classList.toggle("content--wide",["agents","world","activity","chat","history","documents"].includes(e.currentView)),document.querySelector(".content")?.classList.toggle("content--chat",e.currentView==="chat"),e.populateSpecialistSelect();let m=e.$("#rag-mode-select");if(m&&(m.value=e.state.ragMode||"auto"),s.post!==!1&&(e.afterRender({graphs:s.graphs!==!1}),e.state._scrollWorldCreate&&e.currentView==="world"&&(e.state._scrollWorldCreate=!1,requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"})))),e.currentView==="chat"){let o=e.$("#chat-messages");o&&(o.scrollTop=o.scrollHeight)}}e.renderRagModeSelect=S,e.animateLatestChatMessage=k,e.render=b}function Fe(e){function S(t){console.error(`${e.APP_NAME} boot failed:`,t),e.setConnectionStatus("Offline","paused");let a=e.esc(t?.message||String(t));e.$("#content").innerHTML=`<div class="driver-card span-12">
      <p class="title-md">Could not connect to ${e.esc(e.APP_NAME)}</p>
      <p class="body-md muted" style="margin-top:8px">${a}</p>
      <p class="body-md muted" style="margin-top:12px">Make sure <code>python main.py</code> is running, then tap <strong>Refresh</strong> in the top bar.</p>
    </div>`}function k(t,a){let d=e.$("#pin-gate"),r=document.querySelector(".app"),f=e.$("#pin-error"),R=e.$("#pin-input");d&&(d.hidden=!1,d.classList.add("is-visible")),r&&r.setAttribute("inert",""),f&&(t?(f.textContent=t,f.hidden=!1):(f.hidden=!0,f.textContent="")),R&&!a&&(R.disabled=!1,R.focus()),R&&a&&(R.disabled=!0,f&&(f.textContent=`Too many attempts. Wait ${a}s.`,f.hidden=!1)),e.setConnectionStatus("Locked","paused")}function b(){let t=e.$("#pin-gate"),a=document.querySelector(".app");t&&(t.hidden=!0,t.classList.remove("is-visible")),a&&a.removeAttribute("inert")}async function s(){return(await fetch("/api/auth/status",{credentials:"same-origin",headers:{Accept:"application/json"}})).json()}function g(){window.__FOS_PIN_BOUND||(window.__FOS_PIN_BOUND=!0,e.$("#pin-form")?.addEventListener("submit",async t=>{t.preventDefault();let a=(e.$("#pin-input")?.value||"").trim(),d=e.$("#pin-error");if(!/^\d{6}$/.test(a)){d&&(d.textContent="Enter exactly 6 digits",d.hidden=!1);return}try{let r=await fetch("/api/auth/pin",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:a})}),f=await r.json().catch(()=>({}));if(!r.ok)throw new Error(f.error||"Incorrect PIN");e.hidePinGate(),e.$("#pin-input").value="",d&&(d.hidden=!0),await e.startApp()}catch(r){d&&(d.textContent=r.message,d.hidden=!1);let f=await e.fetchAuthStatus().catch(()=>({}));f.locked_seconds&&e.showPinGate(r.message,f.locked_seconds)}}),e.$("#pin-input")?.addEventListener("input",t=>{t.target.value=t.target.value.replace(/\D/g,"").slice(0,6)}))}function c(){e.resolveBootRoute();let t=new URLSearchParams(location.search),a=t.get("world");a&&(e.state.inspectorWorldId=a,e.setActiveWorld(a));let d=t.get("companies");if(d&&e.currentView==="outreach"){let r=d.split(",").map(f=>parseInt(f.trim(),10)).filter(Boolean);r.length&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=r),t.delete("companies")}if(t.get("github")==="connected"||t.get("github_error")){let r=t.get("github_error");r&&console.warn("GitHub auth:",r),t.delete("github"),t.delete("github_error");let f=location.pathname||"/",R=t.toString();history.replaceState({},"",f+(R?`?${R}`:""))}}async function m(){e.applyBootUrlParams(),e.$$(".nav button").forEach(a=>a.classList.toggle("is-active",a.dataset.view===e.currentView)),e.$("#view-title").textContent=e.TITLES[e.currentView]||e.currentView,e.syncMobileNav(e.currentView);try{await e.refresh(!0)}catch(a){e.showBootError(a);return}let t=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1});try{if(await e.loadViewData(e.currentView),t!==e.viewDataLoadGen)return;e.setViewLoading(!1),e.render()}catch(a){console.error(a),t===e.viewDataLoadGen&&e.setViewLoading(!1)}e.startLivePoll(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function o(){e.initContentDelegation(),e.initMdEditorDialog(),e.bindPinGate();let t=window.__FOS_AUTH;if(!t)try{t=await e.fetchAuthStatus()}catch(a){e.showBootError(a);return}if(t.pin_required&&!t.authenticated){e.showPinGate(null,t.locked_seconds||0);return}e.hidePinGate(),await e.startApp()}e.showBootError=S,e.showPinGate=k,e.hidePinGate=b,e.fetchAuthStatus=s,e.bindPinGate=g,e.applyBootUrlParams=c,e.startApp=m,e.boot=o}var re={dashboard:"/",chat:"/ask",agents:"/agents",world:"/worlds",crm:"/crm",outreach:"/outreach",goals:"/goals",memory:"/memory",documents:"/documents",history:"/history",approvals:"/approvals",tools:"/tools",activity:"/activity",settings:"/settings"},Ge=new Set(Object.keys(re)),Ne={"/chat":"chat","/control":"dashboard","/dashboard":"dashboard"},je=Object.fromEntries(Object.entries(re).map(([e,S])=>[e,S]));function mt(e){return!e||e==="/"?"/":e.replace(/\/+$/,"")||"/"}function oe(e){let S=mt(e),k=S.match(/^\/outreach\/campaigns\/(\d+)(?:\/review)?$/);if(k)return{view:"outreach",params:{campaignId:parseInt(k[1],10)}};if(S==="/outreach")return{view:"outreach",params:{}};if(Ne[S]){let b=Ne[S];return{view:b,params:{},redirect:je[b]}}for(let[b,s]of Object.entries(re))if(s===S)return{view:b,params:{}};return{view:"dashboard",params:{},redirect:"/"}}function ne(e,S={}){return e==="outreach"&&S.campaignId?`/outreach/campaigns/${S.campaignId}`:je[e]||"/"}function Be(e){let S=!1;function k(o,t={}){e.routeParams={...t},o==="outreach"&&(e.state.ui||(e.state.ui={}),t.campaignId?e.state.ui.crmCampaignId=t.campaignId:(t.campaignId===null||t.campaignId===void 0)&&(t.keepCampaign||(e.state.ui.crmCampaignId=null)),t.companies?.length&&(e.state.ui.crmOutreachSelected=t.companies.map(Number).filter(Boolean)))}function b(o,t={},{replace:a=!1}={}){Ge.has(o)||(o="dashboard");let d=ne(o,t),r=window.location.search||"",f=d+r,R=window.location.pathname+r;if(f!==R){let A={view:o,params:t};a?window.history.replaceState(A,"",f):window.history.pushState(A,"",f)}k(o,t)}function s({replace:o=!1}={}){let t=oe(window.location.pathname);if(t.redirect){let a=window.location.search||"";window.history.replaceState({view:t.view,params:t.params},"",t.redirect+a)}return k(t.view,t.params),e.currentView=t.view,t}function g(){return localStorage.getItem("fos_crm_tab")==="outreach"?(localStorage.removeItem("fos_crm_tab"),{view:"outreach",params:{}}):null}function c(){let o=new URLSearchParams(window.location.search),t=o.get("view");if(t&&Ge.has(t)){o.delete("view");let d=ne(t,{}),r=o.toString(),f=d+(r?`?${r}`:"");return window.history.replaceState({view:t,params:{}},"",f),k(t,{}),e.currentView=t,{view:t,params:{}}}let a=g();if(a&&window.location.pathname==="/"){let d=window.location.search||"";return window.history.replaceState(a,"",ne(a.view,a.params)+d),k(a.view,a.params),e.currentView=a.view,a}return s({replace:!0})}function m(){window.addEventListener("popstate",()=>{if(S)return;let o=oe(window.location.pathname);k(o.view,o.params),e.goView(o.view,{skipUrl:!0,params:o.params,fromPopstate:!0})})}e.routeParams={},e.pathToRoute=oe,e.routeToPath=ne,e.updateRoute=b,e.syncRouteFromLocation=s,e.resolveBootRoute=c,e.applyRouteParams=k,e.initRouter=m,e._routerSuppressPopstate=o=>{S=o}}function He(e){e.$$(".nav button").forEach(m=>m.addEventListener("click",()=>e.goView(m.dataset.view))),e.$("#btn-sidebar-open")?.addEventListener("click",e.openSidebar);let S=document.querySelector(".app"),k=e.$("#btn-sidebar-collapse"),b="fos_sidebar_collapsed";localStorage.getItem(b)==="1"&&S?.classList.add("sidebar-collapsed");let s=()=>{let m=S?.classList.contains("sidebar-collapsed");k?.setAttribute("aria-label",m?"Expand sidebar":"Collapse sidebar"),k?.setAttribute("title",m?"Expand sidebar":"Collapse sidebar")};s(),k?.addEventListener("click",()=>{S?.classList.toggle("sidebar-collapsed"),localStorage.setItem(b,S?.classList.contains("sidebar-collapsed")?"1":"0"),s()}),e.$("#vault-picker-close")?.addEventListener("click",()=>e.$("#vault-picker-dialog")?.close()),e.$("#vault-picker-dialog")?.addEventListener("click",m=>{m.target.id==="vault-picker-dialog"&&e.$("#vault-picker-dialog").close()}),e.$("#sidebar-close")?.addEventListener("click",e.closeMobileShell),e.$("#sidebar-backdrop")?.addEventListener("click",e.closeMobileShell),document.querySelectorAll(".mobile-tab").forEach(m=>{m.addEventListener("click",()=>{let o=m.dataset.mobileView;o==="more"?(e.syncMobileNav(e.currentView),document.getElementById("mobile-menu-drawer")?.showModal()):e.goView(o)})}),document.querySelectorAll(".mobile-menu-link").forEach(m=>{m.addEventListener("click",()=>e.goView(m.dataset.view))});let g=e.$("#mobile-menu-drawer");e.$("#mobile-menu-close")?.addEventListener("click",()=>g?.close()),g?.addEventListener("click",m=>{m.target===g&&g.close()}),e.$("#btn-refresh")?.addEventListener("click",async()=>{await e.refresh();let m=++e.viewDataLoadGen;e.setViewLoading(!0);try{await e.loadViewData(e.currentView),m===e.viewDataLoadGen&&e.render()}finally{m===e.viewDataLoadGen&&e.setViewLoading(!1)}}),window.addEventListener("resize",()=>{window.innerWidth>900&&e.closeMobileShell()});let c=e.$("#notif-drawer");e.$("#btn-notifications")?.addEventListener("click",()=>{e.renderNotifications(),c?.showModal()}),c?.addEventListener("click",m=>{m.target===c&&c.close()}),e.$("#notif-read-all")?.addEventListener("click",async()=>{await e.api("/notifications/read-all",{method:"POST"}),await e.refresh(),e.renderNotifications(),e.updateBadges()}),e.$("#world-select")?.addEventListener("change",async m=>{let o=m.target,t=o.value||"root";o.disabled=!0;try{e.setActiveWorld(t),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.currentView==="world"&&(e.state.inspectorWorldId=t,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.patchWorldPanels()),await e.onWorldContextChanged({vaultWorldId:t,forceVault:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.state.agentsTab==="vault"?e.patchAgentsVaultPanel():e.render({graphs:!1}),e.updateWorldContextChrome()}catch(a){console.error("world switch failed:",a)}finally{o.disabled=!1}}),window.addEventListener("error",m=>{console.error("UI error:",m.error||m.message),e.state?.config?.my_name||e.setConnectionStatus("UI error \u2014 hard refresh","paused")}),document.addEventListener("visibilitychange",()=>{document.hidden?(e.refreshTimer&&(clearTimeout(e.refreshTimer),e.refreshTimer=null),e.stopLivePoll()):(e.scheduleBackgroundRefresh(),!e.livePollTimer&&e.state?.config&&e.startLivePoll())})}var H={};function ht(){ie(H),le(H),de(H),ce(H),pe(H),ue(H),me(H),he(H),fe(H),ge(H),be(H),ve(H),ye(H),we(H),_e(H),$e(H),Se(H),ke(H),Ce(H),Ie(H),Ae(H),Oe(H),Le(H),Re(H),De(H),Te(H),Pe(H),Ee(H),We(H),Me(H),Ve(H),Fe(H),Be(H)}ht();H.initRouter();He(H);window.__FOS=H;Object.defineProperty(window,"currentView",{get:()=>H.currentView,set:e=>{H.currentView=e}});window.drawGraphs=(...e)=>H.drawGraphs(...e);window.drawDashboardCharts=(...e)=>H.drawDashboardCharts(...e);window.render=(...e)=>H.render(...e);H.boot();H.scheduleBackgroundRefresh();
