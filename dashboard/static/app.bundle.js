var Ue=(e,k=document)=>k.querySelector(e),qe=(e,k=document)=>[...k.querySelectorAll(e)];function ie(e){e.$=Ue,e.$$=qe}function Je(e){let k=document.createElement("div");return k.textContent=e??"",k.innerHTML}function Ke(e){return"$"+Number(e||0).toLocaleString(void 0,{maximumFractionDigits:0})}function ze(e){return e?new Date(typeof e=="number"&&e<1e12?e*1e3:e).toLocaleString():""}function Ye(e){return new Promise(k=>setTimeout(k,e))}function le(e){e.esc=Je,e.fmtMoney=Ke,e.fmtTime=ze,e.sleep=Ye}function Qe(e,k){try{let I=localStorage.getItem(e);return I?JSON.parse(I):k}catch(I){return console.warn(`[storage] corrupt ${e}, resetting`,I),localStorage.removeItem(e),k}}function de(e){e.readJsonStorage=Qe}var Xe="Nawab OS",Ze=[{id:"pulse",label:"Pulse",role:"aggregator",tool_count:0,brief:"Operating pulse across parallel projects"},{id:"outreach",label:"Outreach",role:"outreach",tool_count:0,brief:"Outreach drafts and CRM pipeline"},{id:"leads",label:"Leads",role:"leads",tool_count:0,brief:"Lead lists and contact priorities"},{id:"market",label:"Market intel",role:"research",tool_count:0,brief:"Industry and competitor intelligence"},{id:"vault",label:"Vault",role:"knowledge",tool_count:0,brief:"Knowledge vault librarian"}],xe=[{id:"auto",label:"Auto",hint:"Agent picks retrieval"},{id:"hybrid",label:"Hybrid RAG",hint:"Dense + BM25 fusion"},{id:"graphrag",label:"GraphRAG",hint:"Knowledge graph communities"},{id:"vault",label:"Vault",hint:"World knowledge vault"},{id:"documents",label:"Documents",hint:"Ingested document store"}],et={dashboard:"Control center",chat:"Ask agent",agents:"Agent fleet",world:"Worlds",approvals:"Approvals",crm:"CRM & pipeline",outreach:"Outreach",goals:"Goals & tasks",memory:"Memory",documents:"Documents",history:"History",tools:"Tools",activity:"Activity",settings:"Settings"},tt=["prospect","contacted","replied","meeting","won","lost","nurture"],at=["prospect","contacted","responded","meeting_set","closed","dead"],st=["#f75440","#00666b","#03904a","#051f13","#5a403c","#8f706b","#e3beb8"],nt=15,ot=30,rt=5e3,it=3e4,lt=3e4,dt={aggregator:{label:"Aggregator",cls:"agent-role--aggregator",avatar:"agent-avatar--aggregator"},outreach:{label:"Outreach",cls:"agent-role--outreach",avatar:"agent-avatar--outreach"},leads:{label:"Leads",cls:"agent-role--leads",avatar:"agent-avatar--leads"},research:{label:"Intel",cls:"agent-role--research",avatar:"agent-avatar--research"},knowledge:{label:"Vault",cls:"agent-role--vault",avatar:"agent-avatar--knowledge"}},ct={supervisor:"SV",pulse:"PL",outreach:"OR",leads:"LD",market:"MK",vault:"VL"},pt={root:{label:"Main",cls:"world-kind--root"},project:{label:"Startup",cls:"world-kind--project"},startup:{label:"Startup",cls:"world-kind--project"},technical:{label:"Technical",cls:"world-kind--research"},idea:{label:"Idea",cls:"world-kind--idea"},research:{label:"Research",cls:"world-kind--research"}};function ce(e){Object.assign(e,{APP_NAME:Xe,DEFAULT_SPECIALISTS:Ze,RAG_MODES:xe,TITLES:et,CRM_STATUSES:tt,COMPANY_STATUSES:at,CHART_COLORS:st,MSG_READ_INITIAL_LINES:nt,MSG_READ_EXPAND_LINES:ot,LIVE_POLL_MS:rt,LIVE_POLL_HIDDEN_MS:it,REFRESH_MS:lt,AGENT_ROLES:dt,AGENT_INITIALS:ct,WORLD_KINDS:pt})}function pe(e){async function k(g,s,u="POST"){let c=await fetch("/api"+g,{method:u,body:s,credentials:"same-origin"}),m=await c.json().catch(()=>({}));if(c.status===401&&m.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!c.ok)throw new Error(m.error||c.statusText);return m}async function I(g,s={}){let u=new AbortController,c=s.timeoutMs??3e4,m=setTimeout(()=>u.abort(),c),{timeoutMs:o,headers:t,signal:a,...l}=s;try{let r=await fetch("/api"+g,{...l,credentials:"same-origin",headers:{"Content-Type":"application/json",...t||{}},signal:a||u.signal}),h=await r.json().catch(()=>({}));if(r.status===401&&h.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!r.ok)throw new Error(h.error||r.statusText);return h}catch(r){throw r.name==="AbortError"?new Error("Request timed out \u2014 is the server running?"):r}finally{clearTimeout(m)}}e.api=I,e.apiUpload=k}function ue(e){function k(){let I=localStorage.getItem("fos_selected_specialist");if(I!==null)return I;let g=localStorage.getItem("fos_selected_agent");return g&&g!=="supervisor"?g:""}e.state={live:{},selectedSpecialist:k(),ragMode:localStorage.getItem("fos_rag_mode")||"auto",activeWorldId:localStorage.getItem("fos_active_world")||"root",agentsTab:localStorage.getItem("fos_agents_tab")||"runs",expandedRunId:null,ui:{worldCreateOpen:!1,crmFormOpen:!1,goalsFormOpen:!1,reminderFormOpen:!1,vaultFacet:null,vaultDocForm:null,vaultDocEdit:null},_worldTemplates:null,_operations:{},_chatAttachments:[]},e.state._syncingLinkIds=new Set,e.currentView="dashboard",e.chatHistory=e.readJsonStorage("fos_chat",[]),e.historyTab=localStorage.getItem("fos_history_tab")||"conversations",e.documentsEditMode=!1,e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.livePollTimer=null,e._runtimePollTick=0,e.whatsappPollTimer=null,e.memoryGraphTab="graph",e.worldGraphTab="hierarchy",e.lastLiveActive=!1,e.viewDataLoadGen=0,e.vaultLoadGen=0,e.graphDrawCache={},e.actionBusyDepth=0,e.actionBusyButton=null,e.refreshTimer=null,e.loadSelectedSpecialist=k}function me(e){function k(){let l=e.state.config||{};return l.my_name?`${l.my_name}'s ${e.APP_NAME}`:e.APP_NAME}function I(){return e.state.activeWorldId||e.$("#world-select")?.value||"root"}function g(){let l=e.state.worlds||e.state._worldFull?.worlds||{},r=e.currentWorldId();return r==="root"?l.root?.name||"Main world":(l.children||[]).find(O=>O.id===r)?.name||r}function s(l){e.state.activeWorldId=l||"root",localStorage.setItem("fos_active_world",e.state.activeWorldId),e.populateWorldSelect(),e.updateWorldContextChrome()}function u(){let l=e.$("#world-select");if(!l)return;let r=e.state.activeWorldId||"root";[...l.options].some(h=>h.value===r)&&(l.value=r)}function c(){let l=e.activeWorldLabel();document.querySelectorAll("[data-active-world-label]").forEach(r=>{r.textContent=l}),e.syncWorldSelectValue(),e.currentView==="world"&&e.patchWorldTreeNav()}function m(){let l=e.$("#specialist-select-agents")?.value??e.state.selectedSpecialist??"";return l==="auto"?"":l||""}function o(){return e.$("#rag-mode-select")?.value||e.state.ragMode||"auto"}function t(){return!!e.currentSpecialistId()}function a(){let l=e.$("#world-select");if(!l)return;let r=e.state.worlds||e.state._worldFull?.worlds||{},h=r.root,O=r.children||[],A=O.map(y=>`<option value="${e.esc(y.id)}">${e.esc(y.name)} \xB7 ${e.esc(y.kind||"project")}</option>`).join("");l.innerHTML=`
      <optgroup label="Main">
        <option value="root">${e.esc(h?.name||"Main world")} \u2014 all context</option>
      </optgroup>
      ${O.length?`<optgroup label="Sub-worlds">${A}</optgroup>`:""}`;let v=e.state.activeWorldId||"root";[...l.options].some(y=>y.value===v)?l.value=v:(l.value="root",e.state.activeWorldId="root",localStorage.setItem("fos_active_world","root"))}e.ownerLabel=k,e.currentWorldId=I,e.activeWorldLabel=g,e.setActiveWorld=s,e.syncWorldSelectValue=u,e.updateWorldContextChrome=c,e.currentSpecialistId=m,e.currentRagMode=o,e.isDirectSpecialist=t,e.populateWorldSelect=a}function he(e){function k(t,a={}){e.state._viewLoading=!!t;let l=document.getElementById("global-progress"),r=l?.querySelector(".global-progress__bar");l&&(l.hidden=!t,l.setAttribute("aria-hidden",t?"false":"true"),t&&a.progress==null?(l.classList.add("is-indeterminate"),r&&(r.style.width="")):t&&a.progress!=null?(l.classList.remove("is-indeterminate"),r&&(r.style.width=`${Math.min(100,a.progress)}%`)):(l.classList.remove("is-indeterminate"),r&&(r.style.width="0")))}function I(t){e.actionBusyDepth++,e.actionBusyDepth===1&&(e.state._viewLoading||e.setViewLoading(!0),document.body.classList.add("is-action-busy"));let a=t?.closest?.("button, [role='button']")||t;a&&!e.actionBusyButton&&(e.actionBusyButton=a,a.classList.add("is-loading"),a.setAttribute("aria-busy","true"),"disabled"in a&&(a.disabled=!0))}function g(t){let a=t?.closest?.("button, [role='button']")||t;a&&e.actionBusyButton===a&&(a.classList.remove("is-loading"),a.removeAttribute("aria-busy"),"disabled"in a&&!a.dataset.keepDisabled&&(a.disabled=!1),e.actionBusyButton=null),e.actionBusyDepth=Math.max(0,e.actionBusyDepth-1),e.actionBusyDepth===0&&(e.state._viewLoading||e.setViewLoading(!1),document.body.classList.remove("is-action-busy"))}function s(t,a){e.beginActionBusy(a);try{let l=t();return l!=null&&typeof l.then=="function"?l.finally(()=>e.endActionBusy(a)):(e.endActionBusy(a),l)}catch(l){throw e.endActionBusy(a),l}}function u(t){return!t||t.id==="chat-send"||t.id==="chat-clear"||t.dataset.toggleUi!==void 0||t.dataset.goto!==void 0||t.dataset.toggleRun!==void 0||t.dataset.memoryTab!==void 0||t.dataset.vaultFacet!==void 0||t.dataset.vaultAddDoc!==void 0||t.dataset.vaultCancelDoc!==void 0||t.dataset.removeAttachment!==void 0||t.dataset.historyTab!==void 0||t.dataset.pickVaultDoc!==void 0||t.dataset.cancelEdit!==void 0||t.dataset.editWorld!==void 0||t.dataset.docsAction==="toggle"}function c(t="72%"){return`<span class="skeleton" style="display:block;height:12px;width:${t}"></span>`}function m(t=3){return`<div class="skeleton-card driver-card">${Array.from({length:t},(l,r)=>e.skeletonLine(r===0?"38%":"88%")).join("")}</div>`}function o(t){let a=`<div class="skeleton-grid">${e.skeletonCard(2)}${e.skeletonCard(2)}${e.skeletonCard(2)}</div>`;return t==="dashboard"?`<div class="view-skeleton dashboard-grid">${e.skeletonCard(2)}<div class="span-8">${e.skeletonCard(4)}</div><div class="span-4">${e.skeletonCard(2)}</div>${a}</div>`:t==="chat"?`<div class="view-skeleton"><div class="skeleton-card driver-card">${e.skeletonLine("30%")}${e.skeletonLine("60%")}</div><div class="skeleton-card driver-card" style="min-height:280px">${e.skeletonLine("100%")}${e.skeletonLine("92%")}${e.skeletonLine("78%")}</div></div>`:t==="world"?`<div class="view-skeleton dashboard-grid"><div class="span-4">${e.skeletonCard(3)}</div><div class="span-8">${e.skeletonCard(5)}</div>${a}</div>`:t==="documents"?`<div class="view-skeleton docs-workspace"><div class="skeleton-card driver-card">${e.skeletonCard(4)}</div><div class="skeleton-card driver-card">${e.skeletonCard(6)}</div></div>`:t==="outreach"?`<div class="view-skeleton">${e.skeletonCard(2)}${e.skeletonCard(4)}</div>`:`<div class="view-skeleton">${e.skeletonCard(3)}${a}</div>`}e.setViewLoading=k,e.beginActionBusy=I,e.endActionBusy=g,e.runWithActionBusy=s,e.shouldSkipActionBusy=u,e.skeletonLine=c,e.skeletonCard=m,e.renderViewSkeleton=o}function ge(e){function k(){e.state._worldVault=null,e.state._vaultGraph=null,e.state._vaultWorldId=null,e.state._vaultLoading=!1}function I(){return e.state._worldVault?.vault||e.state._worldVault||null}function g(a){return!!(a&&a!=="root"&&e.state._vaultWorldId===a&&e.vaultPayload())}function s(a,l=""){if(!a)return`${l}:empty`;let r=a.nodes||[],h=a.edges||[],O=a.meta||{},A=r.slice(0,12).map(v=>`${v.data?.id}:${v.data?.label}`).join("|");return`${l}:${r.length}:${h.length}:${O.updated||""}:${O.document_count||""}:${A}`}function u(...a){if(!a.length){Object.keys(e.graphDrawCache).forEach(l=>delete e.graphDrawCache[l]);return}a.forEach(l=>delete e.graphDrawCache[l])}function c(a,l,r={},h="Nothing to visualize yet."){if(!window.FOSGraph)return null;let O=document.getElementById(a);if(!O)return null;let A=O.parentElement?.querySelector(`[data-graph-placeholder-for="${a}"]`);A||(A=document.createElement("p"),A.className="graph-placeholder body-md muted",A.dataset.graphPlaceholderFor=a,O.insertAdjacentElement("afterend",A));let v=l?.nodes||[],y=l?.edges||[],L=v.length===1&&v[0]?.data?.type==="empty",D=v.length===1&&v[0]?.data?.type==="loading",F=v.length+y.length>0&&!L&&!D,w=e.graphDataSignature(l,`${a}:${r.layout?.name||"default"}:${r.onSelect?"interactive":"static"}`),$=null;return F?e.graphDrawCache[a]===w&&FOSGraph.getCy(a)&&!r.onSelect?$=FOSGraph.getCy(a):($=FOSGraph.render(a,l,r),e.graphDrawCache[a]=w):(FOSGraph.destroy(a),delete e.graphDrawCache[a]),$?(O.classList.remove("is-empty"),A.hidden=!0):(O.classList.add("is-empty"),A.hidden=!1,A.textContent=D?v[0]?.data?.label||"Loading\u2026":h),$}function m(a){e.worldGraphTab=a,document.querySelectorAll("[data-world-graph-tab]").forEach(r=>{r.classList.toggle("is-active",r.dataset.worldGraphTab===a)});let l=document.getElementById("world-graph-legend");l&&(l.innerHTML=e.worldGraphLegendHtml(a)),e.drawGraphs()}async function o(){if(window.FOSGraph){try{window.FOSVendors&&await window.FOSVendors.ensure(["cytoscape"])}catch(a){console.warn("cytoscape load failed:",a);return}if(e.currentView==="dashboard"&&e.state._runtimeGraph&&e.renderGraphOrPlaceholder("graph-runtime-dash",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:20}},"Runtime graph appears when an agent is active."),e.currentView==="agents"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-agents")&&e.renderGraphOrPlaceholder("graph-runtime-agents",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="chat"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-chat")&&e.renderGraphOrPlaceholder("graph-runtime-chat",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="world"){let a=e.worldById(e.inspectorWorldId());if(e.worldGraphTab==="vault"&&!e.isRootWorld(a))e.renderGraphOrPlaceholder("graph-world",e.vaultGraphForWorld(a),{layout:FOSGraph.HIERARCHY_LAYOUT,onSelect:l=>{l.facet_id&&(e.state.ui={...e.state.ui||{},vaultFacet:l.facet_id},e.patchWorldPanels())}},"No files yet \u2014 add documents or link a GitHub repo in the knowledge panel below.");else{let l=e.worldGraphTab==="ecosystem"?e.state._worldGraph:e.state._worldHierarchyGraph||e.state._worldGraph;l?(e.renderGraphOrPlaceholder("graph-world",l,{layout:e.worldGraphTab==="hierarchy"?FOSGraph.HIERARCHY_LAYOUT:FOSGraph.LAYOUT,onSelect:r=>{r.world_id&&e.selectInspectorWorld(r.world_id)}},"World map will appear once your hierarchy is loaded."),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())):e.renderGraphOrPlaceholder("graph-world",null,{},"World map will appear once your hierarchy is loaded.")}}e.currentView==="memory"&&e.state._memoryGraph&&e.renderGraphOrPlaceholder("graph-memory",e.state._memoryGraph,{onSelect:a=>{let l=e.$("#graph-memory-detail");l&&(l.textContent=`${a.type}: ${a.label}`)}},"Memory graph fills in as you store knowledge and run agents.")}}async function t(){let a=e.currentView;if(["dashboard","agents","chat","world"].includes(a)&&!e.state._runtimeGraph)try{e.state._runtimeGraph=await e.api("/graph/runtime")}catch{e.state._runtimeGraph=null}if(a==="world"){if(!e.state._worldFull?.graph)try{let r=await e.api("/graph/world");e.state._worldGraph=r?.graph??null,e.state._worldHierarchyGraph=r?.hierarchy_graph??null,e.state._worldPreviews=r?.world_previews??{},e.state._worldFull=r,e.invalidateGraphCache("graph-world")}catch{}}else a==="dashboard"&&e.state._world&&(e.state._worldGraph=e.state._world.graph??e.state._worldGraph??null,e.state._world.worlds&&!e.state.worlds?.root&&(e.state.worlds=e.state._world.worlds));if(a==="memory"&&!e.state._memoryFull?.graph)try{let r=await e.api("/graph/memory");e.state._memoryGraph=r.graph??null,e.state._memoryFull=r,e.invalidateGraphCache("graph-memory")}catch{}}e.clearVaultScopedState=k,e.vaultPayload=I,e.vaultReadyFor=g,e.graphDataSignature=s,e.invalidateGraphCache=u,e.renderGraphOrPlaceholder=c,e.switchWorldGraphTab=m,e.drawGraphs=o,e.loadGraphData=t}function fe(e){function k(o,t="Waiting for activity\u2026"){return o?.length?`<div class="tool-flow">${o.map((a,l)=>{let r=l>0?'<span class="tool-flow-arrow" aria-hidden="true">\u2192</span>':"";if(a.type==="phase")return`${r}<span class="tool-flow-node">${e.esc(a.label)}</span>`;let h=a.decision==="approve"?" is-approve":a.decision==="deny"?" is-deny":"";return`${r}<span class="tool-flow-node${h}">${e.esc(a.name||a.label)}</span>`}).join("")}</div>`:`<p class="body-md muted">${e.esc(t)}</p>`}function I(o,t="live-panel"){let a=o?.jobs?.length?o.jobs:o?.active?[o]:[],l=a.some(v=>v.active||v.status==="running")||o?.active,r=a[0]||o||{},h=r.events||o?.events||[],O=h.map((v,y)=>`<option value="${y}"${y===h.length-1?" selected":""}>${e.esc(v.label||v.name||"Step")}</option>`).join(""),A=a.length?a.map(v=>`
      <div class="live-job${v.active||v.status==="running"?" is-active":""}">
        <div class="live-job__head">
          <span class="mono">${e.esc(v.specialist||v.mode||"agent")}</span>
          <span class="muted">${v.elapsed_s||0}s</span>
        </div>
        <p class="live-job__phase">${e.esc(v.phase||"Working\u2026")}</p>
        ${v.active||v.status==="running"?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(v.id)}">Stop</button>`:`<span class="badge-pill">${e.esc(v.status||"done")}</span>`}
      </div>`).join(""):"";return`<section class="live-panel${l?" is-active":""}" id="${t}" aria-live="polite">
      <div class="live-panel__head">
        <p class="caption-uppercase">Live operation</p>
        ${l&&r.id?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(r.id)}">Stop</button>`:""}
      </div>
      <p class="live-phase" id="${t}-phase">${e.esc(r.phase||o?.phase||"Idle \u2014 send a message or delegate a task")}</p>
      ${h.length?`<label class="live-phase-select"><span class="caption-uppercase">Step</span>
        <select class="world-select" id="${t}-step" aria-label="Current step">${O}</select></label>`:""}
      <div id="${t}-flow">${e.renderLiveFlow(h)}</div>
      ${A?`<div class="live-jobs">${A}</div>`:""}
      ${l&&o?.elapsed_s?`<p class="world-meta">${o.elapsed_s}s elapsed \xB7 ${e.esc(o.actor||r.specialist||"")}</p>`:""}
    </section>`}function g(o){let t=e.$("#live-strip"),a=e.$("#live-strip-text");if(!t)return;let l=!!o?.active;l!==e.lastLiveActive&&(FOSMotion?.pulseLiveStrip?.(l),e.lastLiveActive=l),a&&l&&(a.textContent=o.phase||"Agent working\u2026")}function s(o){e.state.live=o||{},e.updateLiveStrip(o),e.$$("[id$='-phase']").forEach(t=>{t.textContent=o?.phase||"Idle"}),e.$$("[id$='-flow']").forEach(t=>{t.innerHTML=e.renderLiveFlow(o?.events||[])}),e.$$(".live-panel").forEach(t=>t.classList.toggle("is-active",!!o?.active))}async function u(){try{let o=await e.api("/live",{timeoutMs:15e3});if(e.state.live=o,e.patchLiveUI(o),["dashboard","agents","chat"].includes(e.currentView)&&(o?.active||e._runtimePollTick++%4===0)){let a=e.graphDataSignature(e.state._runtimeGraph,"runtime");e.state._runtimeGraph=await e.api("/graph/runtime").catch(()=>e.state._runtimeGraph);let l=e.graphDataSignature(e.state._runtimeGraph,"runtime");a!==l&&(e.invalidateGraphCache("graph-runtime-dash","graph-runtime-agents","graph-runtime-chat"),e.drawGraphs())}}catch{}}function c(){e.stopLivePoll(),e._runtimePollTick=0,e.pollLive(),e.scheduleLivePoll()}function m(){e.livePollTimer&&(clearTimeout(e.livePollTimer),e.livePollTimer=null)}e.renderLiveFlow=k,e.renderLivePanel=I,e.updateLiveStrip=g,e.patchLiveUI=s,e.pollLive=u,e.startLivePoll=c,e.stopLivePoll=m}function be(e){function k(u){return e.state._syncingLinkIds.has(String(u))}function I(){let u=document.getElementById("ops-stack");if(!u)return;let c=Date.now(),m=Object.values(e.state._operations||{}).filter(o=>o.status==="running"||o.finishedAt&&c-o.finishedAt<8e3).slice(0,5);if(!m.length){u.innerHTML="",u.hidden=!0;return}u.hidden=!1,u.innerHTML=m.map(o=>{let t=Math.round((o.progress||0)*100),a=o.status==="running"?"is-running":o.status==="error"?"is-error":"is-done",l=o.status==="running"?"Working":o.status==="error"?"Failed":"Done";return`<div class="ops-card ${a}" data-op-id="${e.esc(o.id)}">
        <div class="ops-card__head">
          <span class="ops-card__title">${e.esc(o.title)}</span>
          <span class="ops-card__status">${l}</span>
        </div>
        <p class="ops-card__detail">${e.esc(o.detail||"")}</p>
        ${o.status==="running"?`<div class="ops-card__bar" role="progressbar" aria-valuenow="${t}" aria-valuemin="0" aria-valuemax="100"><span style="width:${t}%"></span></div>`:""}
      </div>`}).join("")}async function g(u,c,m={}){let o=u;e.state._operations[o]={id:o,title:c,detail:"Scanning repository\u2026",progress:0,status:"running"},m.linkId!=null&&e.state._syncingLinkIds.add(String(m.linkId)),e.renderOpsStack(),m.worldId&&e.currentView==="world"&&e.render();try{for(;;){let t=await e.api(`/sync-jobs/${encodeURIComponent(u)}/batch`,{method:"POST",body:JSON.stringify({batch_size:8}),timeoutMs:18e4}),a=e.state._operations[o];if(a&&(a.progress=t.progress||0,a.detail=t.message||`${t.imported||0} files imported`,a.status=t.status==="failed"?"error":t.done?"done":"running"),e.renderOpsStack(),t.done)break}}catch(t){let a=e.state._operations[o];throw a&&(a.status="error",a.detail=t.message||"Sync failed",a.finishedAt=Date.now()),e.renderOpsStack(),t}finally{let t=e.state._operations[o];t&&!t.finishedAt&&(t.finishedAt=Date.now()),m.linkId!=null&&e.state._syncingLinkIds.delete(String(m.linkId)),e.renderOpsStack();try{await e.refresh(),m.worldId&&await e.reloadVault(m.worldId,{force:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.patchAgentsVaultPanel(),e.updateBadges()}catch{}setTimeout(()=>{delete e.state._operations[o],e.renderOpsStack()},8e3)}}async function s(u){let c=await e.api(`/worlds/${encodeURIComponent(u)}/sync-jobs`).catch(()=>({jobs:[]}));for(let m of c.jobs||[])!m?.id||e.state._operations[m.id]||e.runGithubSyncJob(m.id,`Syncing ${m.full_name}`,{worldId:u,linkId:m.link_id}).catch(console.error)}e.isLinkSyncing=k,e.renderOpsStack=I,e.runGithubSyncJob=g,e.resumeActiveSyncJobs=s}function ve(e){function k(){e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit"}async function I(u,c,m){let o=e.$("#md-editor-dialog");if(!(!o||!u||!c)){e.mdEditorState={mode:"vault",artifactId:null,worldId:u,docId:c,editMode:!1},e.$("#md-dialog-title").textContent=m||"Document",e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit",e.$("#md-dialog-preview").innerHTML="<p class='body-md muted'>Loading\u2026</p>",o.showModal();try{let a=(await e.api(`/worlds/${encodeURIComponent(u)}/vault/documents/${encodeURIComponent(c)}/content`,{timeoutMs:2e4})).content||"";e.$("#md-dialog-source").value=a;let l=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(l,a)}catch(t){e.$("#md-dialog-preview").innerHTML=`<p class="body-md" style="color:var(--color-warn)">${e.esc(t.message||"Could not load document")}</p>`}}}async function g(){let u=e.$("#md-dialog-source")?.value??"";if(e.mdEditorState.mode==="vault"&&e.mdEditorState.worldId&&e.mdEditorState.docId){await e.api(`/worlds/${encodeURIComponent(e.mdEditorState.worldId)}/vault/documents/${encodeURIComponent(e.mdEditorState.docId)}`,{method:"PATCH",body:JSON.stringify({content:u}),timeoutMs:15e3});let m=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(m,u),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit";return}if(!e.mdEditorState.artifactId)return;await e.api(`/artifacts/${e.mdEditorState.artifactId}/content`,{method:"PUT",body:JSON.stringify({content:u}),timeoutMs:15e3});let c=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(c,u),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}function s(){e.$("#md-dialog-close")?.addEventListener("click",()=>{e.$("#md-editor-dialog")?.close(),e.resetMdEditorDialog()}),e.$("#md-dialog-mode")?.addEventListener("click",async()=>{if(e.mdEditorState.mode!=="vault"&&!e.mdEditorState.artifactId)return;e.mdEditorState.editMode=!e.mdEditorState.editMode;let u=e.$("#md-dialog-source"),c=e.$("#md-dialog-preview");if(e.mdEditorState.editMode)u.hidden=!1,c.hidden=!0,e.$("#md-dialog-save").hidden=!1,e.$("#md-dialog-mode").textContent="Preview";else{let m=u?.value??"";await window.FOSMarkdown?.renderInto?.(c,m),u.hidden=!0,c.hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}}),e.$("#md-dialog-save")?.addEventListener("click",()=>e.saveMdEditor().catch(u=>alert(u.message)))}e.resetMdEditorDialog=k,e.openVaultDocViewer=I,e.saveMdEditor=g,e.initMdEditorDialog=s}function ye(e){function k(){let o=e.state._nudges||[];return o.length?`<section class="driver-card span-12 up-next-panel">
      <p class="caption-uppercase">Up next</p>
      <p class="body-md muted">Reminders, follow-ups, approvals, and vault prompts for your active world.</p>
      <ul class="up-next-list">${o.slice(0,8).map((a,l)=>`
      <li class="up-next-item${(a.priority||9)<=2?" is-urgent":""}">
        <div class="up-next-item__body">
          <p class="up-next-item__title">${e.esc(a.title)}</p>
          <p class="up-next-item__meta muted">${e.esc(a.body||"")}</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-nudge-index="${l}">Open</button>
      </li>`).join("")}</ul>
    </section>`:""}function I(o){let t=e.state._nudges?.[Number(o)];if(!t)return;if(t.kind==="vault_leads"&&t.meta?.doc_id){e.tagVaultDocInChat(t.meta.doc_id,t.meta.world_id,t.title,"");return}let a=t.action||"chat";if(a==="crm")return e.goView("crm");if(a==="goals")return e.goView("goals");if(a==="approvals")return e.goView("approvals");if(a==="documents")return e.goView("documents");if(a==="world")return e.goView("world");e.goView(a)}function g(o,t,a){let l=document.getElementById(o);if(!l)return;let r=l.closest(".chart-panel");if(!r)return;let h=r.querySelector(".chart-empty");h||(h=document.createElement("p"),h.className="chart-empty muted body-md",r.appendChild(h)),h.textContent=t,h.hidden=!a,l.hidden=a}function s(){let o=window.innerWidth<640,t=e.state._world?.tools_by_category||e.state.about?.tools_by_category||{},a=Object.entries(t).slice(0,o?5:8);a.length&&e.$("#chart-tools")?(e.chartPanelNote("chart-tools","",!1),FOSCharts.bar("chart-tools",a.map(([A])=>A),a.map(([,A])=>A),{colors:e.CHART_COLORS})):e.chartPanelNote("chart-tools","No tool data yet.",!0);let l=e.state.snapshot?.crm?.by_status||{},r=Object.entries(l).filter(([,A])=>A>0).map(([A,v])=>({label:A,value:v}));r.length&&e.$("#chart-crm")?(e.chartPanelNote("chart-crm","",!1),FOSCharts.donut("chart-crm",r,{centerLabel:"contacts",colors:e.CHART_COLORS})):e.chartPanelNote("chart-crm","No CRM contacts yet \u2014 add leads in Chat or CRM.",!0);let O=[...e.state.usage_history||[]].reverse().map(A=>A.llm_calls||A.calls||0);O.length&&e.$("#chart-usage")?(e.chartPanelNote("chart-usage","",!1),FOSCharts.spark("chart-usage",O)):e.chartPanelNote("chart-usage","No LLM usage in the last 7 days.",!0)}function u(){let o=e.state.config||{},t=e.state.snapshot?.approvals_pending||0,a=o.agent_paused;return`
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
      </section>`}function c(o){if(e.state.ui||(e.state.ui={}),o==="create-world"){e.state.ui.worldCreateOpen=!0,e.currentView==="world"?(e.render(),requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"}))):(e.goView("world"),e.state._scrollWorldCreate=!0);return}if(o==="add-contact"){e.state.ui.crmFormOpen=!0,e.currentView==="crm"?e.render():e.goView("crm");return}if(o==="add-goal"){e.state.ui.goalsFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}if(o==="add-reminder"){e.state.ui.reminderFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}o==="settings"&&e.goView("settings"),o==="approvals"&&e.goView("approvals")}function m(){let o=e.state.snapshot||{},t=o.crm||{},a=e.state.finance||{},l=e.state.usage||{},r=e.state.about||{},h=e.state.config||{},O=o.approvals_pending||0,A=a.set?`<span class="pill ${a.status==="healthy"?"ok":a.status==="warning"?"warn":"info"}">${e.esc(a.status)}</span>`:"",v=a.set?a.runway||(a.runway_months!=null?a.runway_months+" mo":"\u2014"):null,y=(e.state.goals||[]).slice(0,5).map(w=>`<li>${e.esc(w.title)}</li>`).join("")||"<li class='muted'>No active goals \u2014 add one in Goals or use Direct controls.</li>",L=O>0?`<div class="spec-cell race-position-cell"><dt>Approvals</dt><dd>${O}</dd></div>`:'<div class="spec-cell"><dt>Approvals</dt><dd>0</dd></div>',D=e.state.live||{},F=e.state._agents||{};return`<div class="dashboard-grid">
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
            <div class="spec-cell"><dt>Agents</dt><dd>${(F.specialists?.length||4)+1}</dd></div>
            <div class="spec-cell"><dt>Contacts</dt><dd>${t.total_contacts||0}</dd></div>
            ${L}
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
          <div class="activity-timeline">${(e.state.actions||[]).slice(0,8).map(w=>`<div class="activity-timeline__row"><span class="mono">${e.esc(w.tool_name)}</span><span class="muted">${e.esc((w.created_at||"").slice(11,19))}</span></div>`).join("")||"<p class='muted'>No tool actions yet</p>"}</div>
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">Specialist status</p>
          <div class="specialist-chips">${e.listSpecialists(F).map(w=>`<span class="specialist-chip${e.agentBusy(D,w.id)?" is-busy":""}">${e.esc(w.label)}</span>`).join("")}</div>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents" style="margin-top:var(--space-sm)">Open agents</button>
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Runway ${A}</p>
          ${v?`<dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Cash</dt><dd class="small">${e.fmtMoney(a.cash)}</dd></div>
            <div class="spec-cell"><dt>Burn</dt><dd class="small">${e.fmtMoney(a.monthly_burn)}</dd></div>
            <div class="spec-cell"><dt>MRR</dt><dd class="small">${e.fmtMoney(a.mrr)}</dd></div>
            <div class="spec-cell"><dt>Runway</dt><dd class="small">${e.esc(v)}</dd></div>
          </dl>`:'<p class="body-md" style="margin-top:var(--space-sm)">Set cash, burn, and MRR in Settings or ask the agent to track runway.</p>'}
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Active goals</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${y}</ul>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tasks open</dt><dd>${o.tasks_open||0}</dd></div>
            <div class="spec-cell"><dt>LLM today</dt><dd class="small">${l.llm_calls||0}</dd></div>
          </dl>
        </section>
      </div>`}e.renderUpNext=k,e.handleNudgeAction=I,e.chartPanelNote=g,e.drawDashboardCharts=s,e.renderOperatorPanel=u,e.openOperatorAction=c,e.renderDashboard=m}function we(e){function k(){return localStorage.getItem("fos_chat_session")||""}function I(_){_?localStorage.setItem("fos_chat_session",_):localStorage.removeItem("fos_chat_session")}function g(_){_?.session_id&&e.setChatSessionId(_.session_id)}async function s(){let _=e.chatSessionId();if(_)try{let n=await e.api(`/history/sessions/${_}`);n?.messages?.length&&(e.chatHistory=n.messages.map(d=>({role:d.role==="assistant"?"agent":d.role,text:d.content})),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)))}catch{}}function u(_={}){let n={world_id:e.currentWorldId(),rag_mode:e.currentRagMode(),session_id:e.chatSessionId()||void 0,specialist:e.currentSpecialistId()||void 0,..._},d=(e.state._chatAttachments||[]).filter(b=>b?.doc_id);return d.length&&(n.attachments=d.map(b=>({type:"vault",doc_id:b.doc_id,title:b.title,path:b.path}))),n}function c(_){if(_.pending)return`<div class="msg-pending"><span class="live-pulse" aria-hidden="true"></span> ${e.esc(_.pendingLabel||"Agent working\u2026")}</div>`;let n=_.text||"";if(_.role==="agent"||_.role==="assistant"){let d=window.FOSMarkdown?.render?.(n)||e.esc(n),b=(_.artifacts||[]).map(C=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${C.id}">${e.esc(C.title||C.kind||"Document")}</button>`).join("");return`<div class="msg-md">${d}</div>${b?`<div class="msg-artifacts">${b}</div>`:""}`}return`<div class="msg-plain">${e.esc(n)}</div>`}function m(_,n){return`msg:${_}:${e.chatSessionId()||"default"}:${n}`}function o(_){return _<=0?e.MSG_READ_INITIAL_LINES:_===1?e.MSG_READ_INITIAL_LINES+e.MSG_READ_EXPAND_LINES:1/0}function t(_){let n=_||document.getElementById("content");n&&(e.state._msgExpand||(e.state._msgExpand={}),n.querySelectorAll(".msg-read-more-host").forEach(d=>{let b=d.querySelector(":scope > .msg-md, :scope > .msg-plain"),C=d.querySelector(".msg-read-more");if(!b||!C)return;let T=d.dataset.msgScope||"chat",R=d.dataset.msgIndex??"0",j=e.msgExpandKey(T,R),P=e.state._msgExpand[j]||0,z=parseFloat(getComputedStyle(b).lineHeight)||21,J=Math.max(1,Math.round(b.scrollHeight/z)),x=e.msgReadLineLimit(P);if(C.dataset.msgReadMore=j,x>=J||P>=2){b.classList.remove("msg-body--clamped"),b.style.maxHeight="",C.hidden=!0;return}b.classList.add("msg-body--clamped"),b.style.maxHeight=`${x*z}px`,C.hidden=!1,C.textContent="Read more"}))}function a(_){return _?.length?`<div class="msg-artifacts">${_.map(n=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${n.id}">${e.esc(n.title||n.kind||"File")}</button>`).join("")}</div>`:""}async function l(){let _=e.currentWorldId(),n=_&&_!=="root"?`?world_id=${encodeURIComponent(_)}`:"";try{let d=await e.api(`/history${n}`,{timeoutMs:15e3});e.state._chatSessions=d.sessions||[]}catch{e.state._chatSessions=e.state._chatSessions||[]}}function r(){let _=e.state._chatSessions||[],n=e.chatSessionId();return`<section class="chat-sessions-strip driver-card">
      <div class="chat-sessions-strip__head">
        <p class="caption-uppercase">Chats</p>
        <button type="button" class="button-primary button-sm" data-new-chat-session>+ New</button>
      </div>
      <div class="chat-sessions-strip__list">${_.map(b=>`
      <button type="button" class="chat-session-chip${b.id===n?" is-active":""}" data-chat-session="${e.esc(b.id)}">
        <span class="chat-session-chip__title">${e.esc(b.title||"Conversation")}</span>
        <span class="chat-session-chip__meta">${e.fmtHistoryTime(b.updated_at)}</span>
      </button>`).join("")||"<span class='muted body-md'>No previous chats</span>"}</div>
    </section>`}async function h(_){e.openDocumentsWorkspace(_)}function O(){let _=e.state._chatAttachments||[];return _.length?`<div class="chat-attachments">${_.map((n,d)=>`<span class="chat-attachment-chip">
        <span>\u{1F4CE} ${e.esc(n.title||"File")}</span>
        <button type="button" class="chat-attachment-chip__remove" data-remove-attachment="${d}" aria-label="Remove attachment">\xD7</button>
      </span>`).join("")}</div>`:""}async function A(){let _=e.currentWorldId();if(!_||_==="root"){alert("Select a project world (not Main) to attach vault documents.");return}await e.ensureVaultForWorld(_);let n=e.vaultPayload()||{},d=n.facets||n.folders||[],b=[];for(let R of d)for(let j of R.documents||[])e.isMarkdownFilename(j.filename||j.github_path)&&b.push(j);let C=e.$("#vault-picker-list"),T=e.$("#vault-picker-dialog");!C||!T||(C.innerHTML=b.length?b.map(R=>`
      <button type="button" class="vault-picker-item" data-pick-vault-doc="${R.id}" data-world-id="${e.esc(_)}" data-doc-title="${e.esc(R.title)}" data-doc-path="${e.esc(R.github_path||R.filename||"")}">
        <strong>${e.esc(R.title)}</strong>
        <span class="muted">${e.esc(R.github_path||R.filename||"")}</span>
      </button>`).join(""):"<p class='body-md muted'>No markdown docs in vault \u2014 link and sync a GitHub repo in Worlds.</p>",T.showModal())}async function v(_){for(;;){let n=await e.api(`/chat/jobs/${encodeURIComponent(_)}`,{timeoutMs:2e4}),d=n.job;if(!d)break;if(e.state._activeJob=d,e.patchLiveUI(e.state.live),e.patchChatJobBubble(d),["completed","failed","cancelled"].includes(d.status))return{job:d,pending_approvals:n.pending_approvals};await e.sleep(1200)}return null}function y(_){let n=e.chatHistory.findIndex(b=>b.jobId===_.id);if(n<0)return;_.status==="running"?(e.chatHistory[n].pending=!0,e.chatHistory[n].pendingLabel=_.phase||"Agent working\u2026"):(e.chatHistory[n].pending=!1,e.chatHistory[n].text=_.result||_.error||"(no response)",e.chatHistory[n].artifacts=_.artifacts||[],_.session_id&&e.setChatSessionId(_.session_id));let d=e.$("#chat-messages");d&&e.currentView==="chat"&&(d.innerHTML=e.renderChatMessagesInner(),window.FOSMarkdown?.enhance?.(d),e.initMsgReadMore(d),d.scrollTop=d.scrollHeight),e.updateLiveStrip({active:_.status==="running",phase:_.phase}),e.$$("#chat-live-panel-phase, [id$='-phase']").forEach(b=>{b&&(b.textContent=_.phase||"Idle")})}function L(){return e.chatHistory.length?e.chatHistory.map((n,d)=>n.pending?`<div class="msg ${n.role} is-pending"><div class="msg-bubble">${e.renderMessageHtml(n)}</div></div>`:`<div class="msg ${n.role}">
        <div class="msg-bubble msg-read-more-host" data-msg-scope="chat" data-msg-index="${d}">
          ${e.renderMessageHtml(n)}
          <button type="button" class="msg-read-more" hidden>Read more</button>
        </div>
      </div>`).join(""):""}async function D(_,{direct:n=!1,specId:d=""}={}){let b=e.chatPayload({message:_});n&&d&&(b.specialist=d);let C=await e.api("/chat/async",{method:"POST",body:JSON.stringify(b),timeoutMs:2e4});e.state._chatAttachments=[];let T=C.job;e.chatHistory.push({role:"agent",text:"",pending:!0,jobId:T.id,pendingLabel:T.phase||"Starting\u2026"}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.state._activeJob=T,e.render(),e.startLivePoll();try{let R=await e.pollAgentJob(T.id);R?.job?.session_id&&e.setChatSessionId(R.job.session_id),R?.pending_approvals&&(e.state.approvals=R.pending_approvals,e.updateBadges()),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.loadChatSessionsList()}finally{e.state._activeJob=null,e.pollLive(),e.currentView==="chat"&&e.render()}}async function F(_){let n=_||e.state._activeJob?.id;if(n)try{await e.api(`/chat/jobs/${encodeURIComponent(n)}/cancel`,{method:"POST",timeoutMs:1e4}),e.state._activeJob?.id===n?await e.pollAgentJob(n):e.pollLive()}catch(d){alert(d.message)}}function w(){let _=e.state._agents||{},n=e.routingMeta(_),d=e.routingLabel(_),b=e.isDirectSpecialist(),C=e.listSpecialists(_),T=e.state.ragMode||"auto",R=e.RAG_MODES.find(Z=>Z.id===T)||e.RAG_MODES[0],j=e.renderChatMessagesInner(),P=e.state.live||{},z=!e.chatHistory.length,J=!!e.state._activeJob?.active||e.chatHistory.some(Z=>Z.pending),x=e.collectAgentRuns().slice(0,4);return`<div class="chat-shell">
      <header class="chat-header driver-card">
        <div>
          <p class="section-eyebrow">Optional \xB7 agent assist</p>
          <h2 class="title-md">Ask agent</h2>
        </div>
        <div class="chat-header__meta">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          <span class="badge-pill agent-routing-badge">${e.esc(d)}</span>
          ${J?'<span class="badge-pill badge-pill--alert">Working</span>':""}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents">Change specialist</button>
        </div>
      </header>
      ${e.renderChatSessionsList()}
      <div class="chat-layout chat-layout--rich">
        <div class="chat-wrap">
          <div class="chat-messages${z?" is-empty":""}" id="chat-messages">
            ${z?`<div class="chat-empty">
              <p class="title-md">Supervisor ready</p>
              <p class="body-md">Routing: <strong>${e.esc(d)}</strong> \xB7 Retrieval: <strong>${e.esc(R.label)}</strong></p>
              <div class="capability-strip chat-empty__chips">
                <button type="button" class="delegate-hint" data-goto="crm">CRM</button>
                <button type="button" class="delegate-hint" data-goto="goals">Goals</button>
                <button type="button" class="delegate-hint" data-goto="world">Vault / Worlds</button>
                <button type="button" class="delegate-hint" data-goto="documents">Documents</button>
                <button type="button" class="delegate-hint" data-goto="agents">Agents</button>
              </div>
            </div>`:j}
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
              <textarea class="text-input-on-dark chat-input" id="chat-input" placeholder="${b?`Task for ${e.esc(n.label)}\u2026`:"Message supervisor\u2026"}" rows="3"${J?" disabled":""}></textarea>
              <button class="button-primary" id="chat-send"${J?" disabled":""}>${b?`Run ${e.esc(n.label)}`:"Send"}</button>
            </div>
            <div class="chat-toolbar">
              <label class="button-outline-on-dark button-sm upload-label">Upload<input type="file" id="chat-file" hidden accept=".pdf,.docx,.txt,.md,.csv,.json"></label>
              <button type="button" class="button-outline-on-dark button-sm" data-open-vault-picker>Attach vault</button>
              <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New chat</button>
              ${J?'<button type="button" class="button-outline-on-dark button-sm" data-cancel-active-job>Stop</button>':""}
              <button type="button" class="button-outline-on-dark button-sm" data-goto="world">Worlds</button>
            </div>
          </div>
          <section class="driver-card chat-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-chat" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </div>
        <aside class="chat-rail">
          ${e.renderLivePanel(P,"chat-live-panel")}
          <section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Specialists</p>
            <div class="specialist-chips" style="margin-top:var(--space-xxs)">${C.map(Z=>`<span class="specialist-chip${e.currentSpecialistId()===Z.id?" is-selected":""}${e.agentBusy(P,Z.id)?" is-busy":""}">${e.esc(Z.label)}</span>`).join("")}</div>
          </section>
          ${x.length?`<section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Recent runs</p>
            <div class="activity-timeline">${x.map(Z=>`<div class="activity-timeline__row"><span>${e.esc((Z.agent||"").toUpperCase())}</span><span class="muted">${e.esc((Z.task||"").slice(0,40))}</span></div>`).join("")}</div>
          </section>`:""}
        </aside>
      </div>
    </div>`}function $(){requestAnimationFrame(()=>{let _=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),n=_?.[_.length-1];FOSMotion?.animateNewMessage?.(n)})}async function M(){try{await e.api("/auth/logout",{method:"POST",body:"{}"})}catch{}e.showPinGate()}async function G(){let _=e.$("#chat-input"),n=(_?.value||"").trim();if(!n||e.chatHistory.some(j=>j.pending))return;let d=e.currentSpecialistId(),b=e.routingMeta(e.state._agents||{}),C=!!d;_.value="",e.chatHistory.push({role:"user",text:n}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render(),e.animateLatestChatMessage();let T=e.$("#chat-send"),R=C?`Run ${b.label}`:"Send";T&&(T.disabled=!0,T.textContent="\u2026");try{await e.startAgentJob(n,{direct:C,specId:d})}catch(j){e.chatHistory.push({role:"system",text:"Error: "+j.message}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render()}T&&(T.disabled=!1,T.textContent=R),e.animateLatestChatMessage()}async function E(){let _=!e.state.config?.agent_paused;await e.api("/agent/pause",{method:"POST",body:JSON.stringify({paused:_})}),await e.refresh(),e.render()}e.chatSessionId=k,e.setChatSessionId=I,e.applyChatSessionResponse=g,e.loadChatFromServer=s,e.chatPayload=u,e.renderMessageHtml=c,e.msgExpandKey=m,e.msgReadLineLimit=o,e.initMsgReadMore=t,e.renderArtifactLinks=a,e.loadChatSessionsList=l,e.renderChatSessionsList=r,e.openMdEditor=h,e.renderChatAttachmentChips=O,e.openVaultAttachPicker=A,e.pollAgentJob=v,e.patchChatJobBubble=y,e.renderChatMessagesInner=L,e.startAgentJob=D,e.cancelActiveJob=F,e.renderChat=w,e.animateLatestChatMessage=$,e.logoutPin=M,e.sendChat=G,e.togglePause=E}function _e(e){function k(t){t!=null&&(e.state._documentsSelectedId=Number(t)),e.goView("documents")}function I(){let t=e.state._artifacts||[],a=e.state._documentsSelectedId,l=t.find(v=>v.id===a),r=e.state._documentDraft??"",h=e.documentsEditMode,O=t.length?t.map(v=>`
      <button type="button" class="docs-list-item${v.id===a?" is-active":""}" data-select-document="${v.id}">
        <span class="badge-pill">${e.esc(v.kind||"md")}</span>
        <span class="docs-list-item__title">${e.esc(v.title||"Untitled")}</span>
        <span class="docs-list-item__meta muted">${e.fmtHistoryTime(v.created_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No documents yet. Create one or upload a file.</p>",A=`<div class="docs-empty">
      <p class="title-sm">Document workspace</p>
      <p class="body-md muted">Select a document from the list, or create a new markdown file.</p>
      <button type="button" class="button-primary button-sm" data-docs-action="new">+ New document</button>
    </div>`;return l&&(A=`
        <div class="docs-editor__toolbar">
          <input type="text" class="text-input-on-dark docs-title-input" id="docs-title-input" value="${e.esc(l.title||"Untitled")}" aria-label="Document title">
          <select class="text-input-on-dark field-select docs-world-select" id="docs-world-select" aria-label="Project">
            ${e.renderWorldOptionsForDocs(l.world_id||"root")}
          </select>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="toggle">${h?"Preview":"Edit"}</button>
          <button type="button" class="button-primary button-sm" data-docs-action="save">Save</button>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="memory">Save to memory</button>
        </div>
        <div class="docs-editor__body">
          ${h?`<textarea id="docs-source" class="docs-source text-input-on-dark" aria-label="Document source">${e.esc(r)}</textarea>`:'<div id="docs-preview" class="md-content msg-md docs-preview"></div>'}
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
        <section class="driver-card docs-editor-panel">${A}</section>
      </div>`}async function g(){let t=prompt("Document title","Untitled");if(!t)return;let a=e.currentWorldId(),l=await e.api("/artifacts",{method:"POST",body:JSON.stringify({title:t,content:`# ${t}

`,world_id:a&&a!=="root"?a:null}),timeoutMs:15e3});e.state._documentsSelectedId=l.artifact?.id,e.documentsEditMode=!0,await e.loadViewData("documents"),e.render()}async function s(t){if(!t)return;let a=new FormData;a.append("file",t);let l=e.currentWorldId();l&&l!=="root"&&a.append("world_id",l);let r=await e.apiUpload("/artifacts",a);e.state._documentsSelectedId=r.artifact?.id,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function u(){let t=e.state._documentsSelectedId;if(!t)return;let a=document.getElementById("docs-source")?.value??e.state._documentDraft??"",l=document.getElementById("docs-title-input")?.value??"Untitled",r=document.getElementById("docs-world-select")?.value??"root";await e.api(`/artifacts/${t}/content`,{method:"PUT",body:JSON.stringify({content:a}),timeoutMs:15e3}),await e.api(`/artifacts/${t}`,{method:"PATCH",body:JSON.stringify({title:l,world_id:r==="root"?null:r}),timeoutMs:15e3}),e.state._documentDraft=a,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function c(){let t=e.state._documentsSelectedId;if(!t)return;e.documentsEditMode&&await e.saveCurrentDocument();let a=await e.api(`/artifacts/${t}/memory`,{method:"POST",body:"{}",timeoutMs:2e4});alert(`Saved to memory (${a.collection||"documents"}).`)}async function m(t){e.state._documentsSelectedId=Number(t),e.documentsEditMode=!1;try{let a=await e.api(`/artifacts/${t}/content`,{timeoutMs:15e3});e.state._documentDraft=a.content||""}catch(a){e.state._documentDraft="",alert(a.message||"Could not load document")}e.render()}function o(t){let a=(t||"").toLowerCase();return a.endsWith(".md")||a.endsWith(".markdown")||a.endsWith(".rst")}e.openDocumentsWorkspace=k,e.renderDocuments=I,e.createNewDocument=g,e.uploadDocumentFile=s,e.saveCurrentDocument=u,e.saveDocumentToMemory=c,e.selectDocument=m,e.isMarkdownFilename=o}function $e(e){function k(n){let d=n?.supervisor||{};return{id:"supervisor",label:"Supervisor",role:"aggregator",tool_count:n?.total_tools,brief:d.role||"Orchestrates specialists \u2014 picks who to run when routing is Auto"}}function I(n){let d=n?.specialists||[];return(d.length?d:e.DEFAULT_SPECIALISTS).map(C=>({...C,label:C.label||C.id}))}function g(){let n=e.listSpecialists(e.state._agents||{}),d=e.state.selectedSpecialist??"";d&&!n.some(j=>j.id===d)&&(d=""),e.state.selectedSpecialist=d;let C=`<option value="">Auto \u2014 supervisor decides</option>${n.map(j=>`<option value="${e.esc(j.id)}">${e.esc(j.label)}</option>`).join("")}`,T=e.$("#specialist-select-agents");T&&(T.innerHTML=C,T.value=d);let R=e.$("#chat-specialist-select");R&&(R.innerHTML=C,R.value=d)}function s(n){let d=e.currentSpecialistId();return d?`Supervisor \u2192 ${e.listSpecialists(n||e.state._agents||{}).find(C=>C.id===d)?.label||d}`:"Supervisor \xB7 auto-route"}function u(n){let d=e.state._agents||n||{},b=e.currentSpecialistId();return b?e.listSpecialists(d).find(C=>C.id===b)||{id:b,label:b,role:"specialist"}:e.supervisorMeta(d)}function c(n,d){let b=n?.jobs||[],C=String(d||"");if(b.some(R=>R.status==="running"&&(R.specialist===C||C==="supervisor"&&R.mode==="chat")))return!0;let T=n?.active?String(n.actor||""):"";return C==="supervisor"?T==="user":T===`subagent:${C}`||C&&T.includes(C)}function m(n){let d=e.AGENT_ROLES[n]||{label:n||"Specialist",cls:""};return`<span class="agent-role-badge ${d.cls}">${e.esc(d.label)}</span>`}function o(n,d){let b=e.AGENT_ROLES[d]||e.AGENT_ROLES.aggregator,C=e.AGENT_INITIALS[n]||(n||"??").slice(0,2).toUpperCase();return`<span class="agent-avatar ${b.avatar||"agent-avatar--aggregator"}" aria-hidden="true">${e.esc(C)}</span>`}function t(n,d){let b=(d||[]).find(T=>T.agent===n);return b?.ts?new Date(typeof b.ts=="number"&&b.ts<1e12?b.ts*1e3:b.ts).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function a(){let n=e.state._agentRunsApi||[],b=[...e.readJsonStorage("fos_agent_runs",[])];for(let C of n)b.some(T=>T.id===C.id)||b.push({...C,source:"trace"});return b.sort((C,T)=>(T.ts||0)-(C.ts||0)),b.slice(0,50)}function l(n){let d=e.readJsonStorage("fos_agent_runs",[]);d.unshift(n),localStorage.setItem("fos_agent_runs",JSON.stringify(d.slice(0,50)))}function r(n){let d=!e.currentSpecialistId();return`<button type="button" class="fleet-card fleet-card--auto${d?" is-selected":""}" data-select-specialist="" aria-pressed="${d}">
      ${d?'<span class="fleet-card__active-label">Routing</span>':""}
      <div class="fleet-card__top">
        <span class="agent-avatar agent-avatar--aggregator" aria-hidden="true">AU</span>
        <span class="fleet-card__status" title="Supervisor routes"></span>
      </div>
      <div class="fleet-card__name">Auto</div>
      <span class="agent-role-badge agent-role--aggregator">Supervisor picks</span>
      <div class="fleet-card__meta"><span>Default routing</span></div>
    </button>`}function h(n,d){let b=e.supervisorMeta(n),C=e.agentBusy(d,"supervisor");return`<div class="supervisor-banner driver-card">
      <div class="agent-card-title-row">
        ${e.agentAvatar("supervisor",b.role)}
        <div>
          <h2 class="title-md">${e.esc(b.label)} <span class="supervisor-main-tag">Main agent</span></h2>
          <p class="world-meta">${e.esc((b.brief||"").slice(0,140))}</p>
        </div>
      </div>
      <span class="agent-status ${C?"busy":"ready"}">${C?"Working":"Always on"}</span>
    </div>`}function O(n,d,b,C){let T=e.agentBusy(d,n.id),R=b===n.id,j=e.lastRunForAgent(n.id,C);return`<button type="button" class="fleet-card${T?" is-busy":""}${R?" is-selected":""}" data-select-specialist="${e.esc(n.id)}" aria-pressed="${R}">
      ${R?'<span class="fleet-card__active-label">Direct</span>':""}
      <div class="fleet-card__top">
        ${e.agentAvatar(n.id,n.role)}
        <span class="fleet-card__status ${T?"is-busy":""}" title="${T?"Working":"Idle"}"></span>
      </div>
      <div class="fleet-card__name">${e.esc(n.label)}</div>
      ${n.role?e.agentRoleBadge(n.role):""}
      <p class="fleet-card__brief">${e.esc((n.brief||"").slice(0,72))}</p>
      <div class="fleet-card__meta">
        <span>${n.tool_count??"\u2014"} tools</span>
        ${j?`<span>${e.esc(j)}</span>`:""}
      </div>
    </button>`}function A(n,d,b=!1){let C=e.listSpecialists(n),T=e.currentSpecialistId(),R=e.collectAgentRuns();return b?`<div class="fleet-rail">${e.renderFleetAutoCard(d)}${C.map(j=>e.renderFleetCard(j,d,T,R)).join("")}</div>`:`<div class="agent-grid">${C.map(j=>{let P={...j,label:j.label||j.id};return`<article class="agent-card${e.agentBusy(d,j.id)?" is-busy":""}">
          <div class="agent-card-head">${e.renderFleetCardInner(P,d,R)}</div>
        </article>`}).join("")}</div>`}function v(n,d,b){let C=e.agentBusy(d,n.id),T=e.lastRunForAgent(n.id,b);return`
      <div class="agent-card-title-row">
        ${e.agentAvatar(n.id,n.role)}
        <div><h3>${e.esc(n.label)}</h3>${n.role?e.agentRoleBadge(n.role):""}</div>
      </div>
      <span class="agent-status ${C?"busy":"ready"}">${C?"Working":"Ready"}</span>
      <p class="agent-meta">${n.tool_count??0} tools${T?` \xB7 ${e.esc(T)}`:""}</p>`}function y(n){return n.length?`<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Time</th><th>Agent</th><th>Task</th><th>Duration</th><th>Tools</th><th></th></tr></thead>
      <tbody>${n.map(d=>{let b=d.ts?e.fmtTime(d.ts):"\u2014",C=(d.tools||[]).slice(0,4).join(", "),T=e.state.expandedRunId===d.id;return`<tr class="data-row${T?" is-expanded":""}" data-run-id="${e.esc(d.id)}">
          <td class="mono muted">${e.esc(b)}</td>
          <td><span class="fleet-inline-badge">${e.esc((d.agent||"").toUpperCase())}</span></td>
          <td class="task-cell">${e.esc((d.task||"").slice(0,120))}</td>
          <td class="mono">${d.duration_s?`${d.duration_s}s`:"\u2014"}</td>
          <td class="muted">${e.esc(C||"\u2014")}</td>
          <td><button type="button" class="button-tertiary-text button-sm" data-toggle-run="${e.esc(d.id)}">${T?"Hide":"View"}</button></td>
        </tr>
        ${T?`<tr class="data-row-detail"><td colspan="6"><pre class="run-result mono">${e.esc(d.result||"No output recorded")}</pre></td></tr>`:""}`}).join("")}</tbody>
    </table></div>`:'<div class="empty-state"><p class="title-sm">No specialist runs yet</p></div>'}function L(){let n=e.state._tools||{},d=n.by_category||{};return`<div class="console-split">
      <div class="driver-card">${Object.entries(d).sort((C,T)=>T[1]-C[1]).map(([C,T])=>`<div class="kv-row"><span class="k">${e.esc(C)}</span><span class="v">${T}</span></div>`).join("")||"<p class='muted'>No tools loaded</p>"}</div>
      <div class="driver-card tool-list-compact">${(n.tools||[]).slice(0,24).map(C=>`<div class="tool-chip">${e.esc(C.name)}${C.requires_approval?'<span class="badge-pill">approval</span>':""}</div>`).join("")}</div>
    </div>`}function D(){let n=e.state._crm||{},d=n.pipeline||{},b=n.contacts||[],C=n.followups_due||[],T=Object.entries(d).map(([P,z])=>`<div class="kv-row"><span class="k">${e.esc(P)}</span><span class="v">${z}</span></div>`).join(""),R=C.slice(0,8).map(P=>`<li>${e.esc(P.name)} <span class="muted">${e.esc(P.company||"")}</span></li>`).join("")||"<li class='muted'>None due</li>",j=b.slice(0,10).map(P=>`<tr><td>${e.esc(P.name)}</td><td>${e.esc(P.company||"\u2014")}</td><td>${e.esc(P.status||"\u2014")}</td></tr>`).join("");return`<div class="console-split">
      <section class="driver-card"><p class="caption-uppercase">Pipeline</p>${T||"<p class='muted'>Empty</p>"}
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Follow-ups due</p><ul class="list-plain">${R}</ul></section>
      <section class="driver-card"><p class="caption-uppercase">Contacts (${b.length})</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Company</th><th>Status</th></tr></thead>
        <tbody>${j||"<tr><td colspan='3' class='muted'>No contacts</td></tr>"}</tbody></table></div>
        <button type="button" class="button-outline-on-dark button-sm" data-goto="crm" style="margin-top:var(--space-xs)">Open CRM</button>
      </section>
    </div>`}function F(){let n=e.currentWorldId(),d=e.vaultReadyFor(n)?e.vaultPayload()||{}:{},b=d.folders||d.facets||[],C=e.state._agentsVaultQ||"",T=n!=="root"&&!e.vaultReadyFor(n);return`<div class="console-split">
      <section class="driver-card">
        <p class="caption-uppercase">Vault \xB7 ${e.esc(e.activeWorldLabel())}</p>
        ${T?"<p class='body-md muted' style='margin-top:var(--space-xs)'>Loading vault registry\u2026</p>":`<div class="vault-facet-grid" style="margin-top:var(--space-xs)">${b.map(R=>`<div class="vault-facet-card"><div class="vault-facet-head"><h4>${e.esc(R.domain_label||R.label||R.folder||"")}</h4><span class="badge-pill">${R.file_count??0} files</span></div></div>`).join("")||"<p class='muted'>Select a sub-world or link a repo in Worlds</p>"}</div>`}
        <button type="button" class="button-outline-on-dark button-sm" data-goto="world" style="margin-top:var(--space-sm)">Manage vault</button>
      </section>
      <section class="driver-card">
        <div class="search-row">
          <input type="search" class="text-input-on-dark" id="agents-vault-q" placeholder="Search vault\u2026" value="${e.esc(C)}">
          <button type="button" class="button-primary button-sm" id="agents-vault-search">Search</button>
        </div>
        <pre class="run-result mono" id="agents-vault-results" hidden></pre>
      </section>
    </div>`}function w(){let n=e.state.agentsTab||"runs",d=e.collectAgentRuns();if(n==="runs")return e.renderAgentRunsTable(d);if(n==="live"){let b=e.state.live||{};return e.renderLivePanel(b,"agents-tab-live")}return n==="tools"?e.renderAgentsToolsPanel():n==="crm"?e.renderAgentsCrmPanel():n==="vault"?e.renderAgentsVaultPanel():""}function $(){let n=e.state._agents||{},d=e.state.live||n.live||{},b=e.routingMeta(n),C=e.routingLabel(n),T=e.isDirectSpecialist(),R=e.state._delegateDraft||"",j=e.collectAgentRuns(),P=(e.state.approvals||[]).length,z=(n.specialists||[]).filter(ae=>e.agentBusy(d,ae.id)).length,J=n.skills||[],x=e.state.agentsTab||"runs",Z=!!(e.state._delegateResult||"").trim(),ne=e.state._agentActions||[];return`<div class="agents-console">
      <header class="console-toolbar driver-card">
        <div class="console-kpis">
          <div class="console-kpi"><span class="console-kpi__val">${n.specialists?.length||5}</span><span class="console-kpi__lbl">Specialists</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${z||"0"}</span><span class="console-kpi__lbl">Active</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${j.length}</span><span class="console-kpi__lbl">Runs</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${n.total_tools||0}</span><span class="console-kpi__lbl">Tools</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${P}</span><span class="console-kpi__lbl">Approvals</span></div>
        </div>
        <div class="console-toolbar__actions">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          ${J.map(ae=>`<span class="skill-chip${ae.installed?"":" is-missing"}">${e.esc(ae.name)}</span>`).join("")}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="approvals"${P?"":" disabled"}>Approvals${P?` (${P})`:""}</button>
        </div>
      </header>
  
      ${e.renderSupervisorBanner(n,d)}
  
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
        <div class="agent-picker-bar__cards">${e.renderAgentCards(n,d,!0)}</div>
      </section>
  
      <div class="agents-workspace">
        <section class="task-composer driver-card">
          <div class="task-composer__head">
            <div class="agent-card-title-row">
              ${e.agentAvatar(T?b.id:"supervisor",T?b.role:"aggregator")}
              <div>
                <h2 class="title-md">${T?e.esc(b.label):"Supervisor"}</h2>
                <p class="world-meta">${T?e.esc((b.brief||"").slice(0,100)):"Auto-route \u2014 supervisor will delegate to the best specialist"}</p>
              </div>
            </div>
            <span class="agent-status ${e.agentBusy(d,T?b.id:"supervisor")?"busy":"ready"}">${e.esc(C)}</span>
          </div>
          <textarea class="text-input-on-dark task-composer__input" id="delegate-selected" rows="3" placeholder="${T?`Task for ${e.esc(b.label)}\u2026`:"Message supervisor\u2026"}">${e.esc(R)}</textarea>
          <div class="task-composer__foot">
            <button type="button" class="button-primary" id="delegate-selected-btn">${T?`Run ${e.esc(b.label)}`:"Send to supervisor"}</button>
            <span class="world-meta mono" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          </div>
          ${Z?`<div class="delegate-result-wrap msg-read-more-host driver-card" data-msg-scope="agents-delegate" data-msg-index="0">
            <div class="msg-md delegate-result-body">${window.FOSMarkdown?.render?.(e.state._delegateResult||"")||e.esc(e.state._delegateResult||"")}</div>
            <button type="button" class="msg-read-more" hidden>Read more</button>
          </div>`:""}
          <section class="driver-card chat-runtime-panel agents-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-agents" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </section>
  
        <aside class="agents-rail driver-card">
          ${e.renderLivePanel(d,"agents-live-panel")}
          <p class="caption-uppercase" style="margin-top:var(--space-sm)">Recent actions</p>
          <div class="action-feed">${ne.slice(0,8).map(ae=>`<div class="action-feed__item"><span class="mono">${e.esc(ae.tool_name)}</span><span class="muted">${e.esc((ae.created_at||"").slice(11,16))}</span></div>`).join("")||"<p class='muted'>No actions yet</p>"}</div>
        </aside>
      </div>
  
      <section class="driver-card agents-panel">
        <div class="workspace-tabs">
          <button type="button" class="workspace-tab${x==="runs"?" is-active":""}" data-agents-tab="runs">Run history</button>
          <button type="button" class="workspace-tab${x==="live"?" is-active":""}" data-agents-tab="live">Live runtime</button>
          <button type="button" class="workspace-tab${x==="tools"?" is-active":""}" data-agents-tab="tools">Tools</button>
          <button type="button" class="workspace-tab${x==="crm"?" is-active":""}" data-agents-tab="crm">CRM</button>
          <button type="button" class="workspace-tab${x==="vault"?" is-active":""}" data-agents-tab="vault">Vault</button>
        </div>
        <div class="agents-tab-body">${e.renderAgentsTabPanel()}</div>
      </section>
    </div>`}function M(){if(e.currentView!=="agents"||e.state.agentsTab!=="vault")return;let n=document.querySelector(".agents-console .console-split");n&&(n.outerHTML=e.renderAgentsVaultPanel())}function G(n){let d=n||"";e.state.selectedSpecialist=d,localStorage.setItem("fos_selected_specialist",d),e.populateSpecialistSelect(),e.render()}async function E(){let n=e.$("#agents-vault-q")?.value?.trim();e.state._agentsVaultQ=n;let d=e.$("#agents-vault-results"),b=e.currentWorldId();if(!(!n||!b||b==="root"))try{let T=((await e.api(`/vault/search?${new URLSearchParams({q:n,world_id:b})}`)).hits||[]).map(R=>`[${R.metadata?.domain||"?"}] ${R.metadata?.source||""}
${(R.text||"").slice(0,240)}`).join(`

---

`)||"No hits.";d&&(d.textContent=T,d.hidden=!1)}catch(C){d&&(d.textContent=C.message,d.hidden=!1)}}async function _(){let n=e.currentSpecialistId(),d=e.$("#delegate-selected"),b=(d?.value||"").trim();if(!b)return;let C=e.$("#delegate-selected-btn"),T=e.routingMeta(e.state._agents||{}),R=!!n,j=Date.now();C&&(C.disabled=!0,C.textContent="Running\u2026"),e.startLivePoll(),e.state.agentsTab="live",localStorage.setItem("fos_agents_tab","live"),e.state._delegateResult="Agent working\u2026",e.render();try{let P=await e.api("/chat/async",{method:"POST",body:JSON.stringify(e.chatPayload({message:b,specialist:R?n:void 0})),timeoutMs:2e4}),z=await e.pollAgentJob(P.job.id),J=z?.job,x=J?.result||J?.error||"(no response)";e.state._delegateResult=x,e.state._delegateDraft="",d&&(d.value=""),J?.session_id&&e.setChatSessionId(J.session_id),e.persistAgentRun({id:J?.run_id||`local-${j}`,agent:R?n:"supervisor",task:b,result:x,duration_s:J?.elapsed_s||Math.round((Date.now()-j)/1e3),ts:Math.floor(j/1e3),tools:(J?.events||[]).filter(Z=>Z.name).map(Z=>Z.name),source:"delegate",artifacts:J?.artifacts}),e.state.agentsTab="runs",localStorage.setItem("fos_agents_tab","runs"),e.state.expandedRunId=J?.run_id||`local-${j}`,z?.pending_approvals&&(e.state.approvals=z.pending_approvals,e.updateBadges())}catch(P){e.state._delegateResult="Error: "+P.message}C&&(C.disabled=!1,C.textContent=R?`Run ${T.label}`:"Send to supervisor");try{let P=await e.api("/agents/runs");e.state._agentRunsApi=P.runs||[],e.state._agentActions=P.actions||[]}catch{}e.state._activeJob=null,e.pollLive(),e.render(),e.drawGraphs()}e.supervisorMeta=k,e.listSpecialists=I,e.populateSpecialistSelect=g,e.routingLabel=s,e.routingMeta=u,e.agentBusy=c,e.agentRoleBadge=m,e.agentAvatar=o,e.lastRunForAgent=t,e.collectAgentRuns=a,e.persistAgentRun=l,e.renderFleetAutoCard=r,e.renderSupervisorBanner=h,e.renderFleetCard=O,e.renderAgentCards=A,e.renderFleetCardInner=v,e.renderAgentRunsTable=y,e.renderAgentsToolsPanel=L,e.renderAgentsCrmPanel=D,e.renderAgentsVaultPanel=F,e.renderAgentsTabPanel=w,e.renderAgents=$,e.patchAgentsVaultPanel=M,e.selectSpecialist=G,e.agentsVaultSearch=E,e.delegateAgent=_}function Se(e){function k(i){let p=e.state.worlds||e.state._worldFull?.worlds||{},f=p.root,S=p.children||[],W=i||"",B=`<option value="root"${W==="root"||!W?" selected":""}>${e.esc(f?.name||"Main world")}</option>`;return B+=S.map(U=>`<option value="${e.esc(U.id)}"${W===U.id?" selected":""}>${e.esc(U.name)} \xB7 ${e.esc(U.kind||"project")}</option>`).join(""),B}function I(i,p){let f=i?.facets||i?.folders||[],S=[];for(let W of f)for(let B of W.documents||[])B.github_repo===p&&S.push(B);return S.sort((W,B)=>(W.github_path||W.filename||"").localeCompare(B.github_path||B.filename||""))}function g(i){let p=i.filter(f=>{let S=f.github_path||f.filename||"";return/^readme\.md$/i.test(S.split("/").pop()||"")});return p.length?p.sort((f,S)=>(f.github_path||f.filename||"").length-(S.github_path||S.filename||"").length)[0]:null}function s(i){let p=(i.files||[]).length;for(let f of Object.keys(i.dirs||{}))p+=e.countGithubTreeFiles(i.dirs[f]);return p}function u(i,p,f=0){let S=Object.keys(i.dirs||{}).sort(),W=(i.files||[]).sort((U,q)=>U._fileName.localeCompare(q._fileName)),B="";for(let U of S){let q=i.dirs[U],K=e.countGithubTreeFiles(q);B+=`<details class="github-tree-dir"${f<2?" open":""}>
        <summary><span class="mono">${e.esc(U)}</span> <span class="muted">${K} file${K!==1?"s":""}</span></summary>
        <div class="github-tree">${e.renderGithubTreeNode(q,p,f+1)}</div>
      </details>`}for(let U of W){let q=U.github_path||U.filename||U.title,K=/^readme\.md$/i.test((q||"").split("/").pop()||"");B+=`<div class="github-tree-file">
        <span class="github-tree-file__path mono${K?" is-readme":""}">${e.esc(q)}</span>
        <span class="github-tree-file__actions">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-view-doc="${U.id}" data-world-id="${e.esc(p)}" data-doc-title="${e.esc(U.title||q)}">View</button>
          <button type="button" class="button-primary button-sm" data-tag-vault-doc="${U.id}" data-world-id="${e.esc(p)}" data-doc-title="${e.esc(U.title||q)}" data-doc-path="${e.esc(q)}">Tag in agent</button>
        </span>
      </div>`}return B}function c(i,p,f,S){e.state._chatAttachments||(e.state._chatAttachments=[]);let W=Number(i);e.state._chatAttachments.some(B=>B.doc_id===W)||e.state._chatAttachments.push({type:"vault",doc_id:W,title:f||S||"Document",path:S||"",world_id:p}),e.goView("chat")}function m(i,p){if(i?.nodes&&i?.edges)return i;let f=i?.vault||i||{},S=p||{},W=[],B=[],U=S.id||f.world_id||"world",q=`vault-world:${U}`;return W.push({data:{id:q,label:(S.name||"World").slice(0,36),type:"world_root",world_id:U}}),(f.facets||f.folders||[]).forEach(V=>{let Y=V.id||V.folder||"slot",N=`vault-facet:${U}:${Y}`,ee=`${V.label||V.folder||"Folder"} (${V.file_count||0})`;W.push({data:{id:N,label:ee.slice(0,40),type:"vault_facet",facet_id:Y,folder:V.folder}}),B.push({data:{source:q,target:N,label:"folder"}}),(V.documents||[]).slice(0,14).forEach((Q,X)=>{let te=`vault-doc:${Q.id||X}`;W.push({data:{id:te,label:(Q.title||Q.filename||"Document").slice(0,36),type:"vault_file",doc_id:Q.id,facet_id:Y,source:Q.source_type||"upload"}}),B.push({data:{source:N,target:te,label:"doc"}})}),(V.files||[]).slice(0,8).forEach((Q,X)=>{let te=`vault-disk:${U}:${Y}:${X}`;W.push({data:{id:te,label:(Q.name||Q.relative||"file").slice(0,32),type:"vault_file",path:Q.relative,facet_id:Y,source:"disk"}}),B.push({data:{source:N,target:te,label:"disk"}})})}),(f.github_repos||[]).slice(0,10).forEach(V=>{let Y=`gh-repo:${V.id}`;W.push({data:{id:Y,label:(V.full_name||"repo").split("/").pop().slice(0,28),type:"vault_repo",link_id:V.id,repo:V.full_name}}),B.push({data:{source:q,target:Y,label:"github"}})}),W.length<=1&&(W.push({data:{id:"vault-empty",label:"Add docs or link GitHub",type:"empty"}}),B.push({data:{source:q,target:"vault-empty",label:"start"}})),{nodes:W,edges:B}}function o(i){let p=i?.id;if(!p||p==="root")return{nodes:[],edges:[]};if(e.state._vaultLoading&&e.state._vaultWorldId!==p)return{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]};if(e.state._vaultWorldId===p&&e.state._vaultGraph?.nodes?.length)return e.state._vaultGraph;let f=e.vaultReadyFor(p)?e.vaultPayload():null;return f?e.buildVaultGraph(f,i):e.state._vaultLoading?{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]}:{nodes:[{data:{id:"vault-empty",label:"Vault not loaded",type:"empty"}}],edges:[]}}function t(i){return i==="vault"?`
        <span><i style="border-color:#051f13"></i> World</span>
        <span><i style="border-color:#00666b"></i> Folder</span>
        <span><i style="border-color:#8f706b;border-radius:50%"></i> File</span>
        <span><i style="border-color:#f75440;background:#2d312e"></i> GitHub</span>`:`
      <span><i style="border-color:#051f13"></i> Main</span>
      <span><i style="border-color:#f75440"></i> Project</span>
      <span><i style="border-color:#ffb4a8"></i> Idea</span>
      <span><i style="border-color:#00666b"></i> Research</span>
      <span><i style="border-color:#f75440;background:#f7544033"></i> Active</span>`}function a(i="world-create-form"){return`
      <form class="world-form human-form" id="${e.esc(i)}">
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
      </form>`}function l(i){let p=e.worldTreeData(),f=i||"root";return f==="root"||f===p.root?.id?p.root||null:(p.children||[]).find(S=>S.id===f)||null}function r(){return e.state.inspectorWorldId||e.currentWorldId()||"root"}async function h(i,{force:p=!1}={}){if(!i||i==="root"){e.clearVaultScopedState(),e.invalidateGraphCache("graph-world");return}if(!p&&e.vaultReadyFor(i))return;let f=++e.vaultLoadGen;e.state._vaultLoading=!0,e.state._vaultWorldId=i,e.currentView==="world"&&e.patchWorldPanels();try{let S=await e.api(`/worlds/${encodeURIComponent(i)}/vault`);if(f!==e.vaultLoadGen)return;e.state._worldVault=S.vault||null,e.state._vaultGraph=S.vault_graph||null,e.state._vaultWorldId=i,e.invalidateGraphCache("graph-world")}catch{if(f!==e.vaultLoadGen)return;e.clearVaultScopedState()}finally{f===e.vaultLoadGen&&(e.state._vaultLoading=!1)}}async function O(i,p={}){if(!i||i==="root"){e.clearVaultScopedState();return}p.force&&(e.state._vaultWorldId=null),await e.loadWorldVault(i,{force:!0})}async function A(){try{let i=await e.api("/graph/world");e.state._worldFull=i,e.state._worldGraph=i?.graph??null,e.state._worldHierarchyGraph=i?.hierarchy_graph??null,e.state._worldPreviews=i?.world_previews??{},i?.worlds&&(e.state.worlds=i.worlds),e.populateWorldSelect(),e.invalidateGraphCache("graph-world")}catch(i){console.warn("world tree reload failed:",i)}}async function v(i,p={}){if(!i||i==="root"){e.clearVaultScopedState();return}!p.force&&e.vaultReadyFor(i)||await e.loadWorldVault(i,{force:!!p.force})}function y(){let i=e.inspectorWorldId(),p=e.state.activeWorldId||"root";e.$$("[data-inspect-world]").forEach(S=>{let W=S.dataset.inspectWorld;S.classList.toggle("is-inspect",W===i),S.classList.toggle("is-active",W===p)});let f=document.querySelector(".worlds-stat [data-active-world-label]");f&&(f.textContent=e.activeWorldLabel())}function L(){if(e.currentView!=="world")return;let i=e.inspectorWorldId(),p=e.worldById(i),f=e.state._worldFull?.snapshot||e.state.snapshot||{},S=document.getElementById("world-inspector");S&&(S.innerHTML=e.renderWorldInspector(p,f));let W=document.getElementById("world-vault-mount");if(e.isRootWorld(p))W&&(W.innerHTML="");else{let B=e.renderWorldVaultPanel(p);W&&(W.innerHTML=B)}e.patchWorldTreeNav(),e.drawGraphs()}async function D(i={}){let p=e.currentWorldId(),f=e.inspectorWorldId(),S=i.vaultWorldId||(e.currentView==="world"?f:p);!S||S==="root"?e.clearVaultScopedState():await e.ensureVaultForWorld(S,{force:!!i.forceVault}),e.currentView==="world"&&i.reloadTree?await e.reloadWorldTree():(e.currentView==="world"||e.currentView==="dashboard")&&await e.loadGraphData(),e.drawGraphs()}function F(i){let p=i||"root";e.inspectorWorldId()===p&&e.vaultReadyFor(p)&&!e.state._vaultLoading||(e.state.inspectorWorldId=p,e.currentView==="world"&&(e.state._motionSkipOnce=!0,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.patchWorldPanels(),e.reloadVault(p,{force:!0}).then(()=>{e.patchWorldPanels(),FOSMotion?.flashElement?.(e.$("#world-inspector")),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())}).catch(console.error)))}function w(i,p,f,S){let W=i?.id||"root",B=`
      <button type="button" class="world-tree-item is-root${f===W?" is-inspect":""}${S===W?" is-active":""}"
        data-inspect-world="${e.esc(W)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(i?.name||"Main world")}</span>
          <span class="sub">Top-level \xB7 all ventures</span>
        </span>
      </button>`,U=p.map(q=>`
      <button type="button" class="world-tree-item kind-${e.esc(q.kind||"project")}${f===q.id?" is-inspect":""}${S===q.id?" is-active":""}"
        data-inspect-world="${e.esc(q.id)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(q.name)}</span>
          <span class="sub">${e.esc(q.kind||"project")} \xB7 ${e.esc((q.description||"No description").slice(0,42))}</span>
        </span>
      </button>`).join("");return`
      <nav class="world-tree-nav" aria-label="World hierarchy">
        ${B}
        ${p.length?`<div class="world-tree-children">${U}</div>`:""}
      </nav>`}function $(i,p){if(!i)return'<p class="body-md muted">Select a world to inspect its context.</p>';let f=i.id||"root",S=f==="root",W=S?"root":i.kind||"project",B=e.currentWorldId(),q=(e.state._worldPreviews||e.state._worldFull?.world_previews||{})[f]||"",K=p?.crm||{},V=p?.finance||{};if(e.state.worldEditing===f)return`
        <form class="world-edit-form" id="world-edit-form" data-world-id="${e.esc(f)}">
          <div class="world-inspector-title">
            <h2>Edit ${e.esc(i.name)}</h2>
            ${e.worldKindBadge(W)}
          </div>
          ${S?`
            <label>Name<input class="text-input-on-dark" name="name" value="${e.esc(i.name||"")}"></label>`:`
            <label>Name<input class="text-input-on-dark" name="name" value="${e.esc(i.name||"")}" required></label>
            <label>Category
              <select class="text-input-on-dark" name="kind" id="world-edit-kind">
                <option value="project"${i.kind==="project"?" selected":""}>Startup / venture</option>
                <option value="idea"${i.kind==="idea"?" selected":""}>Idea</option>
                <option value="research"${i.kind==="research"?" selected":""}>Technical research</option>
                <option value="technical"${i.kind==="technical"?" selected":""}>Technical project</option>
              </select>
            </label>
            <label>Knowledge template
              <select class="text-input-on-dark" name="template" id="world-edit-template">
                ${(e.state._worldTemplates||[]).map(X=>`<option value="${e.esc(X.id)}"${(i.template||"")===X.id?" selected":""}>${e.esc(X.label)}</option>`).join("")||`<option value="startup"${(i.template||"startup")==="startup"?" selected":""}>Startup / venture</option>`}
              </select>
            </label>`}
          <label>Description<textarea class="text-input-on-dark" name="description" rows="2">${e.esc(i.description||"")}</textarea></label>
          <label>Agent context<textarea class="text-input-on-dark" name="context" rows="5">${e.esc(i.context||"")}</textarea></label>
          <div class="world-inspector-actions">
            <button type="submit" class="button-primary button-sm">Save</button>
            <button type="button" class="button-tertiary-text button-sm" data-cancel-edit>Cancel</button>
          </div>
        </form>`;let N=S?[["Contacts",K.total_contacts||0],["Follow-ups",K.followups_due||0],["Open tasks",p?.tasks_open||0],["Approvals",p?.approvals_pending||0]]:[];S&&V?.set&&N.push(["Runway",V.runway_months!=null?`${V.runway_months} mo`:"\u2014"]);let ee=S?e.worldTreeData().children||[]:[],Q=(p?.goals_active||[]).slice(0,5);return`
      <div class="world-inspector-title">
        <div>
          <h2>${e.esc(i.name)}</h2>
          <p class="world-meta">id: ${e.esc(f)}${i.updated_at?` \xB7 updated ${e.esc(i.updated_at)}`:""}</p>
        </div>
        ${e.worldKindBadge(W)}
      </div>
      ${B===f?'<p class="world-meta" style="color:var(--color-primary)">\u25CF Active for chat &amp; agents</p>':'<p class="world-meta">Not active \u2014 switch from the top bar or below</p>'}
      <div class="world-inspector-section">
        <h4>Description</h4>
        <p>${e.esc(i.description||"No description yet.")}</p>
      </div>
      <div class="world-inspector-section">
        <h4>Agent context</h4>
        <p>${e.esc(i.context||"No focused context \u2014 add what the agent should know in this world.")}</p>
      </div>
      ${N.length?`
        <div class="world-inspector-section">
          <h4>Global snapshot</h4>
          <div class="world-inspector-facts">${N.map(([X,te])=>`<div class="world-inspector-fact"><span class="k">${e.esc(X)}</span><span class="v">${e.esc(String(te))}</span></div>`).join("")}</div>
        </div>`:""}
      ${S&&ee.length?`
        <div class="world-inspector-section">
          <h4>Sub-worlds indexed (${ee.length})</h4>
          <div class="world-inspector-facts">${ee.map(X=>`<div class="world-inspector-fact"><span class="k">${e.esc(X.name)}</span><span class="v">${e.esc(X.kind||"project")}</span></div>`).join("")}</div>
        </div>`:""}
      ${S?"":`
        <div class="world-inspector-section">
          <h4>Template</h4>
          <p class="body-md">${e.esc(i.template||W)} \u2014 facet folders on disk under <code class="mono">data/knowledge/</code></p>
          ${i.github_repo?`<p class="world-meta">GitHub: ${e.esc(i.github_repo)}</p>`:""}
          ${i.repo_path?`<p class="world-meta">Repo: ${e.esc(i.repo_path)}</p>`:""}
        </div>`}
      ${!S&&e.worldTreeData().root?`
        <div class="world-inspector-section">
          <h4>Parent</h4>
          <p class="body-md">${e.esc(e.worldTreeData().root.name)} <span class="world-meta">(main world)</span></p>
        </div>`:""}
      ${Q.length&&S?`
        <div class="world-inspector-section">
          <h4>Active goals</h4>
          <p class="body-md">${Q.map(X=>e.esc(typeof X=="string"?X:X.title||X)).join(" \xB7 ")}</p>
        </div>`:""}
      <div class="world-inspector-section">
        <h4>What the agent sees</h4>
        <pre class="world-context-preview">${e.esc(q||"Preview loads when graph data is fetched\u2026")}</pre>
      </div>
      <div class="world-inspector-actions">
        <button type="button" class="button-primary button-sm" data-use-world="${e.esc(f)}">Use in chat</button>
        <button type="button" class="button-outline-on-dark button-sm" data-set-active-world="${e.esc(f)}">Set active</button>
        <button type="button" class="button-tertiary-text button-sm" data-edit-world="${e.esc(f)}">Edit</button>
        ${S?"":`<button type="button" class="button-tertiary-text button-sm" data-delete-world="${e.esc(f)}">Delete</button>`}
      </div>`}function M(i,p,f){let S=e.state.ui?.vaultDocEdit,W=f||p[0]?.id||p[0]?.folder||"docs",B=p.find(V=>(V.id||V.folder)===W)||p[0]||{label:W,id:W},U=S&&S.title||"",q=S&&S.description||"",K=S?.id||"";return`
      <form class="human-form vault-doc-form" id="vault-doc-form" data-world-id="${e.esc(i.id)}" data-facet-id="${e.esc(W)}">
        ${K?`<input type="hidden" name="doc_id" value="${K}">`:""}
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Category slot</span>
            <select class="text-input-on-dark" name="facet_id" id="vault-doc-facet">
              ${p.map(V=>{let Y=V.id||V.folder;return`<option value="${e.esc(Y)}"${Y===W?" selected":""}>${e.esc(V.label)}</option>`}).join("")}
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Title</span>
            <input class="text-input-on-dark" name="title" required placeholder="e.g. Current ICP" value="${e.esc(U)}"></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description (indexed for search)</span>
          <textarea class="text-input-on-dark" name="description" rows="3" placeholder="Short summary agents use to find this doc. Full content goes to ${e.esc(e.vaultStorageLabel())}.">${e.esc(q)}</textarea></label>
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
        <p class="world-meta">Slot: <strong>${e.esc(B.label)}</strong> \xB7 Full files in ${e.esc(e.vaultStorageLabel())}; only title + description in vector index.</p>
      </form>`}function G(i,p){let f=e.state._githubStatus||{},S=!!f.connected,W=!!f.oauth_configured,B=p.github_repos||[],q=(e.state._githubRepos||[]).map(V=>`<option value="${e.esc(V.full_name)}">${e.esc(V.full_name)}${V.private?" (private)":""}</option>`).join(""),K=B.map(V=>{let Y=e.isLinkSyncing(V.id),N=e.githubRepoDocuments(p,V.full_name),ee=e.findReadmeDoc(N),Q=N.filter(te=>e.isMarkdownFilename(te.github_path||te.filename)),X=Q.length?`<div class="github-tree github-tree--repo">${e.renderGithubTreeNode(e.buildGithubPathTree(Q),i.id)}</div>`:"";return`
      <div class="github-repo-row">
        <div>
          <strong class="mono">${e.esc(V.full_name)}</strong>
          ${Y?'<span class="sync-badge">Syncing</span>':""}
          <span class="world-meta">${V.file_count||N.length||0} files synced${V.synced_at?` \xB7 ${e.esc(V.synced_at)}`:""}</span>
          ${V.last_error?`<span class="world-meta" style="color:var(--color-warn)">${e.esc(V.last_error)}</span>`:""}
        </div>
        <div class="github-repo-row__actions">
          <button type="button" class="button-primary button-sm" data-vault-view-doc="${ee?.id||""}" data-world-id="${e.esc(i.id)}" data-doc-title="${e.esc(ee?.title||`${V.full_name} README`)}"${!ee||Y?" disabled":""}>Open README</button>
          <button type="button" class="button-outline-on-dark button-sm${Y?" is-busy":""}" data-github-sync="${V.id}" data-world-id="${e.esc(i.id)}"${Y?" disabled":""}>${Y?"Syncing\u2026":`Sync to ${e.esc(e.vaultStorageLabel())}`}</button>
          <button type="button" class="button-tertiary-text button-sm" data-github-unlink="${V.id}" data-world-id="${e.esc(i.id)}"${Y?" disabled":""}>Unlink</button>
        </div>
        ${N.length?`<details class="github-repo-files" open>
          <summary class="caption-uppercase">Repo structure \xB7 ${Q.length} markdown file${Q.length===1?"":"s"}</summary>
          ${X||"<p class='muted body-md'>No markdown files synced yet.</p>"}
        </details>`:'<p class="body-md muted github-repo-files-empty">No files synced yet \u2014 link and sync to browse the repo tree here.</p>'}
      </div>`}).join("");return W?S?`<section class="github-repos-panel">
      <div class="github-repos-panel__head">
        <div>
          <p class="section-eyebrow">GitHub repositories</p>
          <p class="body-md muted">Connected as <strong>${e.esc(f.user?.login||"GitHub")}</strong> \u2014 link multiple repos; files sync to ${e.esc(e.vaultStorageLabel())} with searchable descriptions.</p>
        </div>
      </div>
      <div class="human-form__row" style="align-items:flex-end">
        <label class="human-field" style="flex:1">
          <span class="caption-uppercase">Add repository</span>
          <select class="text-input-on-dark" id="github-repo-pick">
            <option value="">Select a repository\u2026</option>
            ${q}
          </select>
        </label>
        <button type="button" class="button-primary button-sm" data-github-add="${e.esc(i.id)}"${e.state._syncingLinkIds.size?" disabled":""}>Link &amp; sync</button>
      </div>
      <div class="github-repo-list">${K||"<p class='body-md muted'>No GitHub repos linked yet.</p>"}</div>
    </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub repositories</p>
        <p class="body-md muted">Authorize GitHub to browse your repos and sync docs into this world's knowledge graph (${e.esc(e.vaultStorageLabel())}).</p>
        <a class="button-primary button-sm" href="/api/github/auth/start?world_id=${encodeURIComponent(i.id)}">Connect GitHub</a>
      </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub</p>
        <p class="body-md muted">Add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to <code>.env</code>, register callback <code>${e.esc(f.redirect_uri||"/api/github/callback")}</code>, then restart.</p>
      </section>`}function E(i,p){let f=i.facets||i.folders||[],S=i.storage_backend||(e.vaultStorageLabel()==="S3"?"s3":"local");return`
      <div class="vault-registry-bar" role="status" aria-live="polite">
        <span class="vault-registry-chip"><span class="k">Template</span> ${e.esc(i.template_id||p.template||"startup")}</span>
        <span class="vault-registry-chip"><span class="k">Slots</span> ${f.length}</span>
        <span class="vault-registry-chip"><span class="k">Docs</span> ${i.document_count||0}</span>
        <span class="vault-registry-chip"><span class="k">Storage</span> ${e.esc(S)}</span>
        <button type="button" class="button-tertiary-text button-sm" data-vault-reload="${e.esc(p.id)}">Reload registry</button>
      </div>`}function _(i){if(!i||i.id==="root")return"";if(e.state._vaultLoading||e.state._vaultWorldId!==i.id)return`
      <section class="driver-card vault-panel knowledge-panel panel-loading" style="margin-top:var(--space-md)">
        <p class="section-eyebrow">Knowledge vault</p>
        <h3 class="title-sm">${e.esc(i.name)}</h3>
        <div class="skeleton-grid" style="margin-top:var(--space-sm)">
          ${e.skeletonCard(3)}${e.skeletonCard(3)}${e.skeletonCard(3)}
        </div>
      </section>`;let p=e.vaultPayload()||{},f=p.facets||p.folders||[],S=p.domain_counts||{},W=e.state.ui?.vaultFacet||f[0]?.id||f[0]?.folder||null,B=e.state.ui?.vaultDocForm||e.state.ui?.vaultDocEdit,U=(f.find(N=>(N.id||N.folder)===W)||{}).documents||[],q=f.map(N=>{let ee=N.id||N.folder,Q=(N.documents||[]).length+(N.files||[]).length;return`<button type="button" class="vault-facet-tab${ee===W?" is-active":""}" data-vault-facet="${e.esc(ee)}">${e.esc(N.label)} <span class="badge-pill">${Q}</span></button>`}).join(""),K=U.map(N=>{let ee=N.github_path?` \xB7 ${N.github_path}`:"",Q=e.isMarkdownFilename(N.filename||N.github_path);return`
      <article class="vault-doc-card" data-doc-id="${N.id}">
        <div class="vault-doc-card__head">
          <h4>${e.esc(N.title)}</h4>
          <span class="world-meta">${e.esc(N.filename||"")}${e.esc(ee)} \xB7 ${e.formatBytes(N.size_bytes)}${N.source_type==="github"?" \xB7 GitHub":""}</span>
        </div>
        <p class="body-md">${e.esc(N.description||"No description")}</p>
        <div class="vault-doc-card__actions">
          ${Q?`<button type="button" class="button-primary button-sm" data-vault-view-doc="${N.id}" data-world-id="${e.esc(i.id)}" data-doc-title="${e.esc(N.title)}">View</button>`:""}
          <button type="button" class="button-outline-on-dark button-sm" data-tag-vault-doc="${N.id}" data-world-id="${e.esc(i.id)}" data-doc-title="${e.esc(N.title)}" data-doc-path="${e.esc(N.github_path||N.filename||"")}">Tag in agent</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-edit-doc="${N.id}">Edit</button>
          <button type="button" class="button-tertiary-text button-sm" data-vault-delete-doc="${N.id}">Remove</button>
        </div>
      </article>`}).join(""),V=(f.find(N=>(N.id||N.folder)===W)||{}).files||[],Y=V.length?`<ul class="vault-file-list">${V.map(N=>`<li class="mono">${e.esc(N.relative||N.name)} <span class="muted">on disk</span></li>`).join("")}</ul>`:"";return`
      <section class="driver-card vault-panel knowledge-panel" style="margin-top:var(--space-md)">
        <div class="vault-panel-head">
          <div>
            <p class="section-eyebrow">Knowledge graph</p>
            <h3 class="title-sm">${e.esc(i.name)} \u2014 ${e.esc(p.template_id||i.template||"startup")} template</h3>
            <p class="body-md muted">Category slots for this world type. Add docs with a searchable description; large files live in ${e.esc(e.vaultStorageLabel())}. Open the <strong>Files</strong> tab in the map above for the folder graph.</p>
            <p class="world-meta">${p.document_count||0} registered docs \xB7 ${e.esc(p.vault_path||"")}${p.repo_path?` \xB7 repo: ${e.esc(p.repo_path)}`:""}</p>
          </div>
          <div class="vault-panel-actions">
            <button type="button" class="button-primary button-sm" data-vault-add-doc="${e.esc(i.id)}">Add document</button>
            <button type="button" class="button-outline-on-dark button-sm" data-world-graph-tab="vault">Open file map</button>
            <input class="text-input-on-dark" id="vault-repo-path" placeholder="Local repo path" value="${e.esc(i.repo_path||"")}">
            <button type="button" class="button-outline-on-dark button-sm" data-vault-link="${e.esc(i.id)}">Link repo</button>
            <button type="button" class="button-outline-on-dark button-sm" data-vault-ingest="${e.esc(i.id)}">Re-ingest</button>
          </div>
        </div>
        ${e.renderGithubReposPanel(i,p)}
        ${e.renderVaultRegistryBar(p,i)}
        <div class="vault-facet-tabs" role="tablist">${q||"<span class='muted'>No categories</span>"}</div>
        ${B?e.renderVaultDocForm(i,f,W):""}
        <div class="vault-doc-grid">${K||"<p class='body-md muted'>No documents in this slot yet \u2014 add your ICP, GTM notes, research, etc.</p>"}</div>
        ${Y}
        <div class="vault-search-row">
          <input class="text-input-on-dark" id="vault-search-q" placeholder="Search descriptions in this world\u2026">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-search="${e.esc(i.id)}">Search</button>
        </div>
        <pre class="vault-search-results mono" id="vault-search-results" hidden></pre>
      </section>`}function n(){let i=e.state._worldFull||{},p=i.worlds||e.state.worlds||{},f=p.root||{},S=p.children||[],W=e.inspectorWorldId(),B=e.currentWorldId(),U=e.worldById(W)||f,q=i.snapshot||e.state.snapshot||{},K=e.state.config?.my_name||"You";e.isRootWorld(U)&&e.worldGraphTab==="vault"&&(e.worldGraphTab="hierarchy");let V=!e.isRootWorld(U);return`
      <div class="worlds-page">
        <section class="worlds-hero">
          <div class="worlds-hero-lead">
            <h2>${e.esc(K)}'s world map</h2>
            <p><strong>Your venture map</strong> \u2014 create worlds, set context, link doc repos, and switch active context. You define each world; agents read what you write.</p>
          </div>
          <div class="worlds-stat">
            <span class="n">${S.length+1}</span>
            <span class="l">Worlds</span>
          </div>
          <div class="worlds-stat">
            <span class="n">${S.length}</span>
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
              ${e.renderWorldTreeNav(f,S,W,B)}
            </div>
          </section>
  
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Map</h3>
              <div class="world-graph-tabs" role="tablist">
                <button type="button" class="world-graph-tab${e.worldGraphTab==="hierarchy"?" is-active":""}" data-world-graph-tab="hierarchy">Hierarchy</button>
                <button type="button" class="world-graph-tab${e.worldGraphTab==="ecosystem"?" is-active":""}" data-world-graph-tab="ecosystem">Ecosystem</button>
                ${V?`<button type="button" class="world-graph-tab${e.worldGraphTab==="vault"?" is-active":""}" data-world-graph-tab="vault">Files</button>`:""}
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
              ${e.renderWorldInspector(U,q)}
            </div>
          </section>
        </div>
  
        ${e.isRootWorld(U)?"":`<div id="world-vault-mount">${e.renderWorldVaultPanel(U)}</div>`}
  
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
      </div>`}function d(i){return!i||i.id==="root"}async function b(i){let p=new FormData(i),f=(p.get("name")||"").toString().trim();if(f)try{let S=await e.api("/worlds",{method:"POST",body:JSON.stringify({name:f,kind:(p.get("kind")||"project").toString(),template:(p.get("template")||"").toString().trim()||void 0,description:(p.get("description")||"").toString().trim(),context:(p.get("context")||"").toString().trim(),repo_path:(p.get("repo_path")||"").toString().trim(),github_repo:(p.get("github_repo")||"").toString().trim()})});e.state.worlds=S.tree,e.setActiveWorld(S.world?.id),await e.refresh(),e.currentView==="world"&&(await e.reloadWorldTree(),e.selectInspectorWorld(S.world?.id)),i.reset(),e.state.ui&&(e.state.ui.worldCreateOpen=!1)}catch(S){alert(S.message)}}async function C(i){let p=i.dataset.worldId;if(!p)return;let f=new FormData(i),S={name:(f.get("name")||"").toString().trim(),description:(f.get("description")||"").toString(),context:(f.get("context")||"").toString()};if(p!=="root"){S.kind=(f.get("kind")||"project").toString();let W=(f.get("template")||"").toString().trim();W&&(S.template=W)}try{let W=await e.api(`/worlds/${encodeURIComponent(p)}`,{method:"PATCH",body:JSON.stringify(S)});e.state.worlds=W.tree,e.state.worldEditing=null,e.currentView==="world"?(await e.reloadWorldTree(),await e.reloadVault(p,{force:!0}),e.patchWorldPanels()):await e.refresh()}catch(W){alert(W.message)}}async function T(i){let p=i.dataset.worldId,f=(i.querySelector("[name=doc_id]")?.value||"").trim(),S=new FormData(i),W=(S.get("title")||"").toString().trim(),B=(S.get("facet_id")||i.dataset.facetId||"docs").toString(),U=(S.get("description")||"").toString().trim(),q=(S.get("content")||"").toString(),K=i.querySelector('input[type="file"]')?.files?.[0];try{if(f)await e.api(`/worlds/${encodeURIComponent(p)}/vault/documents/${encodeURIComponent(f)}`,{method:"PATCH",body:JSON.stringify({title:W,description:U,facet_id:B,content:q||void 0})});else if(K){let V=new FormData;V.append("file",K),V.append("title",W),V.append("description",U),V.append("facet_id",B),await e.apiUpload(`/worlds/${encodeURIComponent(p)}/vault/documents`,V)}else if(q.trim())await e.api(`/worlds/${encodeURIComponent(p)}/vault/documents`,{method:"POST",body:JSON.stringify({title:W,description:U,facet_id:B,content:q})});else return alert("Upload a file or paste markdown content.");e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),await e.reloadVault(p,{force:!0}),e.afterVaultMutation(p)}catch(V){alert(V.message)}}async function R(i,p){e.state.ui||(e.state.ui={});try{let f=await e.api(`/worlds/${encodeURIComponent(i)}/vault/documents/${encodeURIComponent(p)}/content`);e.state.ui.vaultDocEdit=f.document,e.state.ui.vaultDocForm=!0,e.state.ui.vaultFacet=f.document?.facet_id||e.state.ui.vaultFacet,e.currentView==="world"?e.patchWorldPanels():e.render();let S=e.$("#vault-doc-content");S&&(S.value=f.content||"")}catch(f){alert(f.message)}}async function j(i){let p=e.$("#github-repo-pick")?.value?.trim();if(!p)return alert("Select a repository");let f=document.querySelector(`[data-github-add="${i}"]`);f&&(f.disabled=!0);try{let S=await e.api(`/worlds/${encodeURIComponent(i)}/repos`,{method:"POST",body:JSON.stringify({full_name:p}),timeoutMs:12e4});if(S.job?.status==="failed")throw new Error(S.job.message||"Could not start sync");S.job?.id?await e.runGithubSyncJob(S.job.id,`Syncing ${p}`,{worldId:i,linkId:S.repo?.id}):(await e.reloadVault(i,{force:!0}),e.afterVaultMutation(i))}catch(S){alert(S.message)}finally{f&&(f.disabled=e.state._syncingLinkIds.size>0)}}async function P(i,p){if(!e.isLinkSyncing(p))try{let f=await e.api(`/worlds/${encodeURIComponent(i)}/repos/${encodeURIComponent(p)}/sync`,{method:"POST",body:"{}",timeoutMs:12e4});if(f.job?.status==="failed")throw new Error(f.job.message||"Could not start sync");if(f.job?.id){let S=(e.state._worldVault?.github_repos||[]).find(W=>String(W.id)===String(p))?.full_name||"repository";await e.runGithubSyncJob(f.job.id,`Re-syncing ${S}`,{worldId:i,linkId:p})}}catch(f){alert(f.message)}}async function z(i,p){if(confirm("Unlink this repo and remove its synced documents from this world?"))try{await e.api(`/worlds/${encodeURIComponent(i)}/repos/${encodeURIComponent(p)}`,{method:"DELETE"}),await e.reloadVault(i,{force:!0}),e.afterVaultMutation(i)}catch(f){alert(f.message)}}async function J(i,p){if(confirm("Remove this document from the knowledge graph?"))try{await e.api(`/worlds/${encodeURIComponent(i)}/vault/documents/${encodeURIComponent(p)}`,{method:"DELETE"}),await e.reloadVault(i,{force:!0}),e.afterVaultMutation(i)}catch(f){alert(f.message)}}async function x(i){try{let p=await e.api(`/worlds/${encodeURIComponent(i)}/vault/ingest`,{method:"POST",body:"{}"});alert(`Ingested ${p.files||0} files (${p.total_chunks||0} chunks)`),await e.reloadVault(i,{force:!0}),e.afterVaultMutation(i)}catch(p){alert(p.message)}}async function Z(i){let p=e.$("#vault-repo-path")?.value?.trim();if(!p)return alert("Enter a local repo path");try{let f=await e.api(`/worlds/${encodeURIComponent(i)}/vault/link-repo`,{method:"POST",body:JSON.stringify({repo_path:p})});if(f.error)return alert(f.error);alert(`Linked and ingested ${f.files||0} files`),await e.reloadVault(i,{force:!0}),await e.refresh(),e.afterVaultMutation(i)}catch(f){alert(f.message)}}async function ne(i){let p=e.$("#vault-search-q")?.value?.trim();if(!p)return;let f=e.$("#vault-search-results");try{let W=((await e.api(`/vault/search?${new URLSearchParams({q:p,world_id:i})}`)).hits||[]).map(B=>`[${B.metadata?.domain||"?"}] ${B.metadata?.source||""}
${(B.text||"").slice(0,200)}`).join(`

---

`)||"No hits.";f&&(f.textContent=W,f.hidden=!1)}catch(S){f&&(f.textContent=S.message,f.hidden=!1)}}async function ae(i){if(confirm("Delete this sub-world?"))try{let p=await e.api(`/worlds/${encodeURIComponent(i)}`,{method:"DELETE"});e.state.worlds=p.tree,e.currentWorldId()===i&&e.setActiveWorld("root"),e.inspectorWorldId()===i&&e.selectInspectorWorld("root"),await e.refresh(),e.currentView==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.render())}catch(p){alert(p.message)}}e.renderWorldOptionsForDocs=k,e.githubRepoDocuments=I,e.findReadmeDoc=g,e.countGithubTreeFiles=s,e.renderGithubTreeNode=u,e.tagVaultDocInChat=c,e.buildVaultGraph=m,e.vaultGraphForWorld=o,e.worldGraphLegendHtml=t,e.renderWorldCreateForm=a,e.worldById=l,e.inspectorWorldId=r,e.loadWorldVault=h,e.reloadVault=O,e.reloadWorldTree=A,e.ensureVaultForWorld=v,e.patchWorldTreeNav=y,e.patchWorldPanels=L,e.onWorldContextChanged=D,e.selectInspectorWorld=F,e.renderWorldTreeNav=w,e.renderWorldInspector=$,e.renderVaultDocForm=M,e.renderGithubReposPanel=G,e.renderVaultRegistryBar=E,e.renderWorldVaultPanel=_,e.renderWorld=n,e.isRootWorld=d,e.createWorldFromForm=b,e.saveWorldEdit=C,e.submitVaultDoc=T,e.startVaultDocEdit=R,e.connectGithubRepo=j,e.syncGithubRepo=P,e.unlinkGithubRepo=z,e.deleteVaultDoc=J,e.vaultIngest=x,e.vaultLinkRepo=Z,e.vaultSearch=ne,e.deleteWorld=ae}function ke(e){function k(){let y=e.state.ui?.crmTab||localStorage.getItem("fos_crm_tab")||"contacts";return y==="outreach"?"contacts":y}function I(y){let L=e.state.worlds||e.state._worldFull?.worlds||{},D=L.root,F=L.children||[],w=[];return D&&w.push(`<option value="${e.esc(D.id||"root")}"${(y||"root")===(D.id||"root")?" selected":""}>${e.esc(D.name||"Main world")}</option>`),F.forEach($=>{w.push(`<option value="${e.esc($.id)}"${y===$.id?" selected":""}>${e.esc($.name||$.id)}</option>`)}),w.join("")}function g(y={}){let L=e.crmTab();return`<nav class="crm-tabs" role="tablist" aria-label="CRM sections">${[["contacts","Contacts",y.contacts],["companies","Companies",y.companies],["pipeline","Pipeline",null]].map(([F,w,$])=>`<button type="button" role="tab" aria-selected="${L===F}" class="crm-tab${L===F?" crm-tab--active":""}" data-crm-tab="${F}">${e.esc(w)}${$!=null?`<span class="crm-tab__count">${$}</span>`:""}</button>`).join("")}</nav>`}function s(){let y=e.state._crm?.contacts||[],L=e.state._crm?.followups_due||[],D=!!e.state.ui?.crmFormOpen,F=e.state._crmCompanies?.companies||[],w=E=>e.CRM_STATUSES.map(_=>`<option value="${_}"${_===E?" selected":""}>${e.esc(_)}</option>`).join(""),$='<option value="">\u2014 None \u2014</option>'+F.map(E=>`<option value="${E.id}">${e.esc(E.name)}</option>`).join(""),M=y.slice(0,50).map(E=>`<tr>
      <td>${e.esc(E.name)}</td><td>${e.esc(E.company||"\u2014")}</td><td>${e.esc(E.role||"\u2014")}</td>
      <td><select class="text-input-on-dark crm-status-select" data-crm-status="${E.id}" aria-label="Status for ${e.esc(E.name)}">${w(E.status||"prospect")}</select></td>
      <td class="muted">${e.esc(E.email||"")}</td>
      <td class="muted">${e.esc(E.phone||"")}</td>
      <td><label class="human-field--checkbox" style="margin:0">
        <input type="checkbox" data-crm-whatsapp="${E.id}" ${E.whatsapp_enabled?"checked":""} ${E.phone?"":"disabled"} aria-label="Allow WhatsApp for ${e.esc(E.name)}">
      </label></td>
      <td>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${E.id}" data-followup-days="3">3d</button>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${E.id}" data-followup-days="7">7d</button>
        ${E.whatsapp_enabled?`<button type="button" class="button-tertiary-text button-sm" data-crm-wa-thread="${E.id}">WA</button>`:""}
      </td></tr>`).join(""),G=L.map(E=>`<li class="crm-followup-row">
      <span>${e.esc(E.name)} @ ${e.esc(E.company||"?")}</span>
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
              <select class="text-input-on-dark" name="company_id">${$}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Role</span>
              <input class="text-input-on-dark" name="role" placeholder="Title"></label>
            <label class="human-field"><span class="caption-uppercase">Email</span>
              <input class="text-input-on-dark" name="email" type="email" placeholder="email@company.com"></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${w("prospect")}</select></label>
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
      <section class="driver-card span-12"><p class="caption-uppercase">Follow-ups due</p><ul class="list-plain" style="margin-top:var(--space-sm)">${G}</ul></section>
      <section class="band-light span-12">
        <p class="caption-uppercase" style="color:var(--color-muted)">Contacts (${y.length})</p>
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Role</th><th>Status</th><th>Email</th><th>Phone</th><th>WA</th><th>Follow up</th></tr></thead>
        <tbody>${M||'<tr><td colspan="8" class="muted">No contacts yet \u2014 use Add contact above.</td></tr>'}</tbody></table></div>
        ${e.state._crmWaThread?.length?`<div class="driver-card" style="margin-top:var(--space-md)">
          <p class="caption-uppercase">WhatsApp thread</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${e.state._crmWaThread.map(E=>`<li><span class="muted">${e.esc((E.sent_at||"").slice(0,16).replace("T"," "))}</span> <strong>${e.esc(E.direction||"")}</strong>: ${e.esc((E.body||"").slice(0,200))}</li>`).join("")}</ul>
        </div>`:""}
      </section>`}function u(){if(e.state._crmCompaniesLoading)return`<section class="driver-card span-12 crm-loading-panel" aria-busy="true">
        <div class="crm-skeleton crm-skeleton--title"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
      </section>`;if(e.state._crmCompaniesError)return`<section class="driver-card span-12 crm-error-panel">
        <p class="body-md">Could not load companies \u2014 ${e.esc(e.state._crmCompaniesError)}</p>
        <button type="button" class="button-primary button-sm" data-crm-reload>Retry</button>
      </section>`;let y=e.state._crmCompanies?.companies||[],L=e.state._crmCompanies?.meta?.unlinked_contact_companies||0,D=!!e.state.ui?.crmCompanyFormOpen,F=e.state.ui?.crmCompanyDetail,w=e.currentWorldId(),$=n=>e.COMPANY_STATUSES.map(d=>`<option value="${d}"${d===n?" selected":""}>${e.esc(d)}</option>`).join(""),M=y.map(n=>`<tr>
      <td><button type="button" class="button-tertiary-text" data-crm-company-detail="${n.id}">${e.esc(n.name)}</button></td>
      <td>${e.esc(n.sector||n.industry||"\u2014")}</td>
      <td><span class="crm-status-pill crm-status-pill--${e.esc((n.status||"prospect").replace(/\s+/g,"-"))}">${e.esc(n.status||"prospect")}</span></td>
      <td>${n.contact_count??0}</td>
      <td class="muted">${e.esc((n.last_contacted_at||"").slice(0,10))}</td>
    </tr>`).join(""),G="";if(F){let n=y.find(b=>String(b.id)===String(F))||e.state._crmCompanyDetail?.company,d=e.state._crmCompanyDetail?.contacts||[];n&&(G=`<aside class="crm-company-drawer driver-card">
          <div class="human-panel__head">
            <h4 class="title-sm">${e.esc(n.name)}</h4>
            <button type="button" class="button-outline-on-dark button-sm" data-crm-company-close>Close</button>
          </div>
          <dl class="settings-kv">
            <div class="settings-kv__row"><dt>Sector</dt><dd>${e.esc(n.sector||n.industry||"\u2014")}</dd></div>
            <div class="settings-kv__row"><dt>Status</dt><dd>${e.esc(n.status||"prospect")}</dd></div>
            <div class="settings-kv__row"><dt>Website</dt><dd>${n.website?`<a href="${e.esc(n.website)}" target="_blank" rel="noopener">${e.esc(n.website)}</a>`:"\u2014"}</dd></div>
          </dl>
          ${n.research_summary?`<p class="body-md" style="margin-top:var(--space-sm)">${e.esc(n.research_summary)}</p>`:""}
          ${n.notes?`<p class="muted body-sm">${e.esc(n.notes)}</p>`:""}
          <p class="caption-uppercase" style="margin-top:var(--space-md)">Linked contacts (${d.length})</p>
          <ul class="list-plain">${d.map(b=>`<li>${e.esc(b.name)} \u2014 ${e.esc(b.role||"")} ${b.email?`<span class="muted">${e.esc(b.email)}</span>`:""}</li>`).join("")||"<li class='muted'>None</li>"}</ul>
        </aside>`)}let E=L>0?`
      <div class="crm-import-banner">
        <div>
          <p class="body-md"><strong>${L}</strong> unique company name${L===1?"":"s"} on contacts not yet linked to company records.</p>
          <p class="body-sm muted">Import creates company rows and links your existing contacts automatically.</p>
        </div>
        <button type="button" class="button-primary button-sm" data-crm-import-companies>Import from contacts</button>
      </div>`:"",_=M?"":`
      <div class="crm-empty-state">
        <p class="body-md">No company records yet.</p>
        <p class="body-sm muted">${L>0?"Import from contacts above, or add a company manually.":"Add companies manually, or enter company names when adding contacts."}</p>
      </div>`;return`
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <h3 class="title-sm">Companies</h3>
            <p class="body-sm muted">${y.length} account${y.length===1?"":"s"}</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-outline-on-dark button-sm" data-goto="outreach">Start outreach</button>
            <button type="button" class="button-outline-on-dark button-sm" data-crm-reload>Refresh</button>
            <button type="button" class="button-primary button-sm" data-toggle-ui="crmCompanyFormOpen">${D?"Hide form":"Add company"}</button>
          </div>
        </div>
        ${E}
        ${D?`
        <form class="human-form" id="crm-company-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Company name"></label>
            <label class="human-field"><span class="caption-uppercase">World</span>
              <select class="text-input-on-dark" name="world_id" required>${e.renderWorldOptionsForCrm(w)}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Sector</span>
              <input class="text-input-on-dark" name="sector" placeholder="e.g. Manufacturing"></label>
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${$("prospect")}</select></label>
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
        ${_||`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Sector</th><th>Status</th><th>Contacts</th><th>Last contact</th></tr></thead>
        <tbody>${M}</tbody></table></div>`}
        ${G}
      </section>`}function c(){let y=e.state._crm?.pipeline||{},L=Object.entries(y).map(([$,M])=>`<div class="kv"><span class="k">${e.esc($)}</span><span class="v">${M}</span></div>`).join("")||"<p class='muted'>No pipeline data</p>",D=e.state._crmCompanies?.companies||[],F={};D.forEach($=>{let M=$.status||"prospect";F[M]=(F[M]||0)+1});let w=Object.entries(F).map(([$,M])=>`<div class="kv"><span class="k">${e.esc($)}</span><span class="v">${M} companies</span></div>`).join("")||"<p class='muted'>No company pipeline data</p>";return`<section class="driver-card span-6"><p class="caption-uppercase">Contact pipeline</p><div style="margin-top:var(--space-sm)">${L}</div></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Company pipeline</p><div style="margin-top:var(--space-sm)">${w}</div></section>`}function m(){let y=e.crmTab(),L={contacts:e.state._crm?.contacts?.length||0,companies:e.state._crmCompanies?.companies?.length||0},D="";return y==="contacts"?D=e.renderCrmContactsPanel():y==="companies"?D=e.renderCrmCompaniesPanel():D=e.renderCrmPipelinePanel(),`<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <h2 class="title-md" style="text-wrap:balance">CRM</h2>
            <p class="body-sm muted">Contacts, companies, and pipeline. Batch outreach lives on the <button type="button" class="button-tertiary-text button-sm" data-goto="outreach">Outreach</button> page.</p>
          </div>
        </div>
        ${e.renderCrmTabs(L)}
      </section>
      ${D}
    </div>`}async function o(){let y=e.crmTab(),L=e.currentWorldId(),D=y==="companies"?"?include_unassigned=1":L&&L!=="root"?`?world_id=${encodeURIComponent(L)}&include_unassigned=1`:"?include_unassigned=1";e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[F,w]=await Promise.all([e.api("/crm/contacts"),e.api(`/crm/companies${D}`)]);e.state._crm=F,e.state._crmCompanies=w}catch(F){e.state._crmCompaniesError=F.message||"Could not load CRM data"}finally{e.state._crmCompaniesLoading=!1}}async function t(y){let L=new FormData(y),D=(L.get("name")||"").toString().trim();if(!D)return;let F=(L.get("company_id")||"").toString().trim();try{await e.api("/crm/contacts",{method:"POST",body:JSON.stringify({name:D,company_id:F?parseInt(F,10):null,role:(L.get("role")||"").toString().trim(),email:(L.get("email")||"").toString().trim(),status:(L.get("status")||"prospect").toString(),linkedin_url:(L.get("linkedin_url")||"").toString().trim(),phone:(L.get("phone")||"").toString().trim(),whatsapp_enabled:L.get("whatsapp_enabled")==="1",notes:(L.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmFormOpen=!1),await e.refresh(),e.render(),y.reset()}catch(w){alert(w.message)}}async function a(){let y=e.currentWorldId(),L=y&&y!=="root"?y:null;try{let D=await e.api("/crm/companies/import-from-contacts",{method:"POST",body:JSON.stringify({world_id:L})});await e.loadCrmData(),e.render();let F=`Imported ${D.created||0} companies and linked ${D.linked_contacts||0} contacts.`;e.state._toast?e.state._toast(F):alert(F)}catch(D){alert(D.message)}}async function l(y){let L=new FormData(y),D=(L.get("name")||"").toString().trim(),F=(L.get("world_id")||"").toString().trim();if(!(!D||!F))try{await e.api("/crm/companies",{method:"POST",body:JSON.stringify({name:D,world_id:F,sector:(L.get("sector")||"").toString().trim(),status:(L.get("status")||"prospect").toString(),website:(L.get("website")||"").toString().trim(),linkedin_url:(L.get("linkedin_url")||"").toString().trim(),notes:(L.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmCompanyFormOpen=!1),e.render(),y.reset()}catch(w){alert(w.message)}}async function r(y){if(y)try{let L=await e.api(`/crm/companies/${encodeURIComponent(y)}`);e.state._crmCompanyDetail=L,e.state.ui||(e.state.ui={}),e.state.ui.crmCompanyDetail=y,e.render()}catch(L){alert(L.message)}}async function h(y,L){if(!(!y||!L))try{await e.api(`/crm/contacts/${encodeURIComponent(y)}`,{method:"PATCH",body:JSON.stringify({status:L})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(D){alert(D.message)}}async function O(y,L){if(y)try{await e.api(`/crm/contacts/${encodeURIComponent(y)}`,{method:"PATCH",body:JSON.stringify({whatsapp_enabled:!!L})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(D){alert(D.message)}}async function A(y){if(y)try{let L=await e.api(`/whatsapp/messages?contact_id=${encodeURIComponent(y)}`);e.state._crmWaThread=L.messages||[],e.render()}catch(L){alert(L.message)}}async function v(y,L){let D=parseInt(L,10)||7;await e.api(`/crm/contacts/${y}/followup`,{method:"POST",body:JSON.stringify({days:D}),timeoutMs:15e3}),e.state._crm=await e.api("/crm/contacts"),e.currentView==="crm"&&e.render()}e.crmTab=k,e.renderWorldOptionsForCrm=I,e.renderCrmTabs=g,e.renderCrmContactsPanel=s,e.renderCrmCompaniesPanel=u,e.renderCrmPipelinePanel=c,e.renderCrm=m,e.loadCrmData=o,e.submitCrmContact=t,e.importCrmCompaniesFromContacts=a,e.submitCrmCompany=l,e.openCrmCompanyDetail=r,e.updateCrmStatus=h,e.updateCrmWhatsapp=O,e.loadCrmWaThread=A,e.scheduleCrmFollowup=v}function Ce(e){function k(){return e.state.ui?.crmOutreachWorld||e.currentWorldId()}function I(){let w=e.state._crmCampaignReview,$=w?.campaign;return $?.status==="done"||w?.done&&!w?.pending_count?"complete":w?.campaign&&["review"].includes($.status)&&w.pending_count>0?"review":w?.campaign&&["review"].includes($.status)&&!w.pending_count?"complete":e.state._crmOutreachJob?.active||["researching","drafting","created"].includes($?.status||e.state._crmOutreachJob?.status)||e.state.ui?.crmCampaignId&&$&&!["review","done","failed"].includes($.status)?"running":"setup"}function g(w){if(w.channel==="email"){if(!(w.subject||"").trim())return"Subject required";if(!(w.body||"").trim())return"Body required";if(!(w.email||"").trim())return"Contact has no email"}if(w.channel==="whatsapp"){if(!(w.body||"").trim())return"Message required";if((w.body||"").length>300)return"Max 300 characters";if(!w.whatsapp_enabled)return"WhatsApp not allowlisted";if(!(w.phone||"").trim())return"No phone on contact"}return""}function s(w){let $=[["setup","1. Setup"],["running","2. Research & draft"],["review","3. Review & send"],["complete","4. Done"]],G={setup:0,running:1,review:2,complete:3}[w]??0;return`<nav class="crm-outreach-steps" aria-label="Outreach progress">${$.map(([E,_],n)=>`<span class="${n<G?"crm-outreach-step crm-outreach-step--done":n===G?"crm-outreach-step crm-outreach-step--active":"crm-outreach-step"}">${e.esc(_)}</span>`).join("")}</nav>`}function u(){let w=e.state._crmOutreachJob||{},$=e.state._crmCampaignDetail?.campaign||e.state._crmCampaignReview?.campaign||{},M=w.phase||$.status||"Starting\u2026",E=(e.state._crmCampaignReview?.companies||e.state._crmCampaignDetail?.review?.companies||[]).length||$.batch_size||"?";return`<section class="driver-card span-12 crm-outreach-running">
      <p class="section-eyebrow">Outreach in progress</p>
      <h3 class="title-sm">${e.esc($.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("running")}
      <div class="crm-outreach-progress-strip">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:40%"></div></div>
        <p class="body-md"><strong>${e.esc(M)}</strong></p>
        <p class="muted body-sm">Researching companies via knowledge tree + web, then drafting messages. This runs in the background \u2014 you can leave this page.</p>
        <p class="muted body-sm">Batch: ${E} companies \xB7 World: <span data-active-world-label>${e.esc(e.activeWorldLabel())}</span></p>
      </div>
      <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-refresh>Refresh status</button>
    </section>`}function c(w){let $=w.progress||{},M=$.by_status||{};return`<section class="driver-card span-12">
      <p class="section-eyebrow">Campaign complete</p>
      <h3 class="title-sm">${e.esc(w.campaign?.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("complete")}
      <div class="crm-outreach-summary">
        <div class="kv"><span class="k">Sent</span><span class="v">${M.sent||0}</span></div>
        <div class="kv"><span class="k">Skipped</span><span class="v">${M.skipped||0}</span></div>
        <div class="kv"><span class="k">Failed</span><span class="v">${M.failed||0}</span></div>
        <div class="kv"><span class="k">Companies</span><span class="v">${$.companies_complete||0}/${$.companies_total||0}</span></div>
      </div>
      <div class="human-form__actions" style="margin-top:var(--space-md)">
        <button type="button" class="button-primary button-sm" data-crm-outreach-back>Start new campaign</button>
      </div>
    </section>`}function m(w){let $=w.campaign,M=w.strategy||{},G=w.current_company,E=w.current_research||{},_=w.current_drafts||[],n=w.progress||{},d=_.filter(P=>P.channel==="email"),b=_.filter(P=>P.channel==="whatsapp"),C=G?.company_name||G?.name||"Company",T=n.company_index||1,R=n.companies_total||1,j=P=>{let z=e.draftApproveDisabledReason(P),J=(P.body||"").length;return`<div class="crm-draft-card driver-card" data-draft-id="${P.id}">
        <div class="crm-draft-card__head">
          <p class="caption-uppercase">${P.channel==="email"?"Gmail":"WhatsApp"} \u2192 ${e.esc(P.contact_name||"Contact")}</p>
          ${P.channel==="email"?`<span class="muted body-sm">${e.esc(P.email||"")}</span>`:`<span class="muted body-sm">${e.esc(P.phone||"")}</span>`}
        </div>
        ${P.personalization_notes?`<p class="body-sm muted">${e.esc(P.personalization_notes)}</p>`:""}
        ${P.channel==="email"?`<label class="human-field"><span class="caption-uppercase">Subject</span>
          <input class="text-input-on-dark crm-draft-subject" data-draft-id="${P.id}" value="${e.esc(P.subject||"")}"></label>`:""}
        <label class="human-field"><span class="caption-uppercase">Message</span>
          <textarea class="text-input-on-dark crm-draft-body" data-draft-id="${P.id}" data-channel="${e.esc(P.channel)}" rows="${P.channel==="whatsapp"?3:6}">${e.esc(P.body||"")}</textarea>
          ${P.channel==="whatsapp"?`<span class="caption muted crm-wa-count" data-draft-id="${P.id}">${J}/300</span>`:""}
        </label>
        <div class="human-form__actions">
          <button type="button" class="button-primary button-sm" data-crm-draft-approve="${P.id}" ${z?'disabled title="'+e.esc(z)+'"':""}>Approve &amp; Send</button>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-draft-skip="${P.id}">Skip message</button>
        </div>
        ${P.error_message?`<p class="crm-draft-error">${e.esc(P.error_message)}</p>`:""}
        ${z?`<p class="muted body-sm">${e.esc(z)}</p>`:""}
      </div>`};return`<section class="driver-card span-12">
      <div class="human-panel__head">
        <div>
          <p class="section-eyebrow">Review &amp; send</p>
          <h3 class="title-sm">${e.esc($.name||"Campaign")}</h3>
          <p class="muted body-sm">Company ${T} of ${R} \xB7 ${w.pending_count||0} message(s) left \u2014 approve one at a time</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-back>Exit review</button>
      </div>
      ${e.renderOutreachSteps("review")}
      <div class="crm-outreach-progress-meta">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:${Math.round((n.companies_complete||0)/Math.max(R,1)*100)}%"></div></div>
        <div class="crm-outreach-stats">
          <span class="badge-pill">Sent ${(n.by_status||{}).sent||0}</span>
          <span class="badge-pill">Skipped ${(n.by_status||{}).skipped||0}</span>
          <span class="badge-pill">Pending ${w.pending_count||0}</span>
        </div>
      </div>
      <details class="crm-strategy-details">
        <summary class="caption-uppercase">Cohort strategy</summary>
        <pre class="body-sm muted" style="white-space:pre-wrap">${e.esc(JSON.stringify(M,null,2))}</pre>
      </details>
      ${G?`<div class="crm-company-review driver-card">
        <div class="human-panel__head">
          <h4 class="title-sm">${e.esc(C)}</h4>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-skip-company="${G.company_id}">Skip company</button>
        </div>
        <p class="body-sm muted">${e.esc(E.sector||G.sector||"")}</p>
        ${E.crm_research_summary?`<p class="body-sm">${e.esc(String(E.crm_research_summary).slice(0,400))}</p>`:""}
        ${(E.web_hits||[]).length?`<p class="caption-uppercase">Web signals</p><ul class="list-plain">${E.web_hits.slice(0,3).map(P=>`<li class="body-sm">${e.esc(P.snippet||P.title||"")}${P.url?` <a href="${e.esc(P.url)}" target="_blank" rel="noopener">link</a>`:""}</li>`).join("")}</ul>`:""}
        ${(E.vault_files_used||[]).length?`<p class="caption-uppercase">Vault files used</p><ul class="list-plain">${E.vault_files_used.map(P=>`<li class="body-sm">${e.esc(P.title||"doc #"+P.doc_id)}</li>`).join("")}</ul>`:""}
      </div>`:""}
      ${d.length?'<p class="caption-uppercase">Email drafts</p>':""}
      ${d.map(j).join("")}
      ${b.length?'<p class="caption-uppercase" style="margin-top:var(--space-md)">WhatsApp drafts</p>':""}
      ${b.map(j).join("")}
      ${!_.length&&G?'<p class="muted">No drafts for this company \u2014 contacts may lack email or WhatsApp allowlist.</p>':""}
    </section>`}function o(){let w=e.state._crmCampaigns?.campaigns||[],$=e.outreachWorldId(),M=(e.state._crmCompanies?.companies||[]).filter(R=>$&&$!=="root"&&R.world_id&&R.world_id!==$?!1:R.status==="prospect"||!R.status),G=e.state.ui?.crmOutreachBatch||5,E=new Set(e.state.ui?.crmOutreachSelected||[]),n=((e.state.worlds||e.state._worldFull?.worlds||{}).children||[]).length>0,d=M.map(R=>{let j=E.has(R.id),P=R.contact_count||0;return`<label class="crm-company-check human-field--checkbox">
        <input type="checkbox" data-crm-company-toggle="${R.id}" ${j?"checked":""} ${E.size>=G&&!j?"disabled":""}>
        <span>${e.esc(R.name)} <span class="muted">${e.esc(R.sector||"")} \xB7 ${P} contact(s)</span></span>
      </label>`}).join(""),b=[5,10,15,20].map(R=>`<option value="${R}"${G===R?" selected":""}>${R}</option>`).join(""),C=w.slice(0,12).map(R=>`<tr>
        <td><button type="button" class="${R.status==="review"?"button-primary":"button-tertiary-text"} button-sm" data-crm-campaign="${R.id}">${e.esc(R.name)}</button></td>
        <td><span class="badge-pill">${e.esc(R.status)}</span></td>
        <td class="muted">${e.esc((R.created_at||"").slice(0,10))}</td>
        <td>${R.status==="review"?`<button type="button" class="button-outline-on-dark button-sm" data-crm-campaign="${R.id}">Continue review</button>`:""}</td>
      </tr>`).join("")||'<tr><td colspan="4" class="muted">No campaigns yet</td></tr>',T=M.length?`<p class="caption-uppercase">Companies (${E.size}/${G} selected)</p>
         <div class="crm-company-checklist">${d}</div>`:`<div class="crm-outreach-empty">
          <p class="body-md">No prospect companies available for this world.</p>
          <p class="body-sm muted">Go to CRM Companies and import from your existing contacts, or add companies manually.</p>
          <div class="human-form__actions">
            <button type="button" class="button-primary button-sm" data-outreach-open-crm-companies>Open companies in CRM</button>
          </div>
        </div>`;return`<section class="driver-card span-12 human-panel">
      <div class="human-panel__head">
        <div>
          <h3 class="title-sm">Batch outreach</h3>
          <p class="body-sm muted">Research, strategy, and personalized drafts \u2014 you approve every send.</p>
        </div>
      </div>
      ${e.renderOutreachSteps("setup")}
      ${n?"":'<p class="crm-outreach-warn">Create a sub-world under <strong>World</strong> first \u2014 outreach requires a venture context for vault research.</p>'}
      <form class="human-form" id="crm-outreach-form" style="margin-top:var(--space-md)">
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">World (required)</span>
            <select class="text-input-on-dark" name="world_id" id="crm-outreach-world">${e.renderWorldOptionsForCrm($)}</select></label>
          <label class="human-field"><span class="caption-uppercase">Batch size</span>
            <select class="text-input-on-dark" name="batch_size" id="crm-outreach-batch">${b}</select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Outreach brief</span>
          <textarea class="text-input-on-dark" name="brief" rows="3" placeholder="e.g. Indian manufacturing SMBs \u2014 energy cost savings, 15-min discovery call, direct tone"></textarea></label>
        ${T}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm" ${E.size&&$!=="root"?"":"disabled"}>
            Start outreach (${E.size||0} companies)
          </button>
        </div>
      </form>
      <section style="margin-top:var(--space-lg)">
        <p class="caption-uppercase">Recent campaigns</p>
        <div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${C}</tbody></table></div>
      </section>
    </section>`}function t(){let w=e.outreachStep(),$=e.state._crmCampaignReview;return w==="running"?e.renderOutreachRunningPanel():w==="complete"&&$?.campaign?e.renderOutreachCompletePanel($):w==="review"&&$?.campaign?e.renderOutreachReviewPanel($):e.renderOutreachSetupPanel()}function a(){return`<div class="dashboard-grid">
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
    </div>`}async function l(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld||(e.state.ui.crmOutreachWorld=e.currentWorldId());let w=e.outreachWorldId(),$=w&&w!=="root"?`?world_id=${encodeURIComponent(w)}&include_unassigned=1`:"?include_unassigned=1",M=w&&w!=="root"?`?world_id=${encodeURIComponent(w)}`:"",G=e.routeParams?.campaignId||e.state.ui?.crmCampaignId;e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[E,_]=await Promise.all([e.api(`/crm/companies${$}`),e.api(`/crm/outreach/campaigns${M}`).catch(()=>({campaigns:[]}))]);if(e.state._crmCompanies=E,e.state._crmCampaigns=_,G){e.state.ui.crmCampaignId=G;let[n,d]=await Promise.all([e.api(`/crm/outreach/campaigns/${G}`).catch(()=>null),e.api(`/crm/outreach/campaigns/${G}/review`).catch(()=>null)]);e.state._crmCampaignDetail=n,e.state._crmCampaignReview=d?.campaign?d:n?.review;let b=e.state._crmCampaignReview?.campaign||n?.campaign;b&&["researching","drafting","created"].includes(b.status)?(e.state._crmOutreachJob={active:!0,phase:b.status,status:b.status},e.state._crmOutreachPollId||e.pollCrmOutreachJob(G)):b?.status==="review"&&(e.state._crmOutreachJob={phase:"Ready for review",active:!1})}}catch(E){e.state._crmCompaniesError=E.message||"Could not load outreach data"}finally{e.state._crmCompaniesLoading=!1}}async function r(w){let $=new FormData(w),M=($.get("world_id")||"").toString().trim(),G=parseInt($.get("batch_size")||"5",10)||5,E=($.get("brief")||"").toString().trim(),_=e.state.ui?.crmOutreachSelected||[];if(!M||M==="root")return alert("Select a sub-world for outreach (not Main world).");if(!_.length)return alert("Select at least one company.");if(!E)return alert("Add a brief so the agent knows what kind of message to write.");try{let n=await e.api("/crm/outreach/campaigns",{method:"POST",body:JSON.stringify({world_id:M,batch_size:G,brief:E,company_ids:_})});await e.api(`/crm/outreach/campaigns/${n.campaign_id}/start`,{method:"POST"}),e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=[],e.goView("outreach",{params:{campaignId:n.campaign_id}}),e.pollCrmOutreachJob(n.campaign_id)}catch(n){alert(n.message)}}async function h(w,$=!1){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId);let M=async()=>{try{let G=await e.api(`/crm/outreach/campaigns/${w}`),E=G.campaign||{},_=G.review||{},n=G.job||{};if(e.state._crmCampaignDetail=G,E.status==="review"||E.status==="done"||E.status==="failed"){e.state._crmOutreachJob={active:!1,phase:E.status==="review"?"Ready for review":E.status},e.state._crmCampaignReview=_.campaign?_:await e.api(`/crm/outreach/campaigns/${w}/review`),e.state._crmOutreachPollId=null,e.currentView==="outreach"&&e.render();return}e.state._crmOutreachJob={active:!0,phase:n.phase||E.status||"running\u2026",status:E.status},e.currentView==="outreach"&&e.render(),$||(e.state._crmOutreachPollId=setTimeout(M,2500))}catch{$||(e.state._crmOutreachPollId=setTimeout(M,4e3))}};$?await M():e.state._crmOutreachPollId=setTimeout(M,500)}async function O(w){w&&e.goView("outreach",{params:{campaignId:parseInt(w,10)}})}function A(){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null,e.state.ui&&(e.state.ui.crmCampaignId=null,e.state.ui.crmOutreachSelected=[]),e.state._crmCampaignReview=null,e.state._crmCampaignDetail=null,e.state._crmOutreachJob=null,e.goView("outreach",{params:{}})}function v(w){let $=parseInt(w.dataset.crmCompanyToggle,10);if(!$)return;e.state.ui||(e.state.ui={});let M=e.state.ui.crmOutreachBatch||5,G=new Set(e.state.ui.crmOutreachSelected||[]);if(w.checked){if(G.size>=M){w.checked=!1;return}G.add($)}else G.delete($);e.state.ui.crmOutreachSelected=[...G],e.render()}async function y(w){let $=e.state.ui?.crmCampaignId;if(!(!$||!w)&&confirm("Skip all pending messages for this company?"))try{await e.api(`/crm/outreach/campaigns/${$}/companies/${w}/skip`,{method:"POST"}),e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${$}/review`),e.render()}catch(M){alert(M.message)}}async function L(w){let $=document.querySelector(`.crm-draft-subject[data-draft-id="${w}"]`),M=document.querySelector(`.crm-draft-body[data-draft-id="${w}"]`),G={};$&&(G.subject=$.value),M&&(G.body=M.value),Object.keys(G).length&&await e.api(`/crm/outreach/drafts/${w}`,{method:"PATCH",body:JSON.stringify(G)})}async function D(w){if(w)try{await e.saveCrmDraftEdits(w);let $=await e.api(`/crm/outreach/drafts/${w}/approve-send`,{method:"POST"});if($.error)return alert($.error);let M=e.state.ui?.crmCampaignId;M&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${M}/review`)),await e.loadOutreachData(),e.render()}catch($){alert($.message)}}async function F(w){if(w)try{await e.api(`/crm/outreach/drafts/${w}/skip`,{method:"POST"});let $=e.state.ui?.crmCampaignId;$&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${$}/review`)),e.render()}catch($){alert($.message)}}e.outreachWorldId=k,e.outreachStep=I,e.draftApproveDisabledReason=g,e.renderOutreachSteps=s,e.renderOutreachRunningPanel=u,e.renderOutreachCompletePanel=c,e.renderOutreachReviewPanel=m,e.renderOutreachSetupPanel=o,e.renderOutreachBody=t,e.renderOutreach=a,e.loadOutreachData=l,e.submitCrmOutreach=r,e.pollCrmOutreachJob=h,e.openCrmCampaignReview=O,e.closeCrmCampaignReview=A,e.toggleCrmOutreachCompany=v,e.skipCrmCompany=y,e.saveCrmDraftEdits=L,e.approveCrmDraft=D,e.skipCrmDraft=F}function Ie(e){function k(){let c=e.state._goals||{},m=!!e.state.ui?.goalsFormOpen,o=!!e.state.ui?.reminderFormOpen,t=(c.active||[]).map(h=>`<li class="goal-row">
      <span><strong>${e.esc(h.title)}</strong>${h.detail?" \u2014 "+e.esc(h.detail):""}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goal-done="${h.id}">Done</button>
    </li>`).join("")||"<li class='muted'>No active goals \u2014 add one below.</li>",a=(e.state.tasks||[]).map(h=>`<li>${e.esc(h.title)} <span class="muted">P${h.priority||3}</span></li>`).join("")||"<li class='muted'>No open tasks</li>",l=(c.reminders||[]).map(h=>`<li class="reminder-row">
      <span>${e.esc(h.text)} <span class="muted">${e.esc((h.due_at||"").slice(0,16).replace("T"," "))}</span></span>
      <span class="reminder-row__actions">
        <button type="button" class="button-outline-on-dark button-sm" data-reminder-done="${h.id}">Done</button>
        <button type="button" class="button-tertiary-text button-sm" data-reminder-cancel="${h.id}">Cancel</button>
      </span>
    </li>`).join("")||"<li class='muted'>No reminders</li>",r=(c.plans||[]).map(h=>`<li>${e.esc(h.goal)}</li>`).join("")||"<li class='muted'>No open plans</li>";return`<div class="dashboard-grid">
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
      <section class="driver-card span-6"><p class="caption-uppercase">Reminders</p><ul class="list-plain" style="margin-top:var(--space-sm)">${l}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Plans &amp; projects</p><ul class="list-plain" style="margin-top:var(--space-sm)">${r}</ul></section>
    </div>`}async function I(c){let m=new FormData(c),o=(m.get("title")||"").toString().trim();if(o)try{await e.api("/goals",{method:"POST",body:JSON.stringify({title:o,detail:(m.get("detail")||"").toString().trim(),priority:parseInt(m.get("priority")||"3",10)||3})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.goalsFormOpen=!1),await e.refresh(),e.render(),c.reset()}catch(t){alert(t.message)}}async function g(c){if(c)try{await e.api(`/goals/${encodeURIComponent(c)}`,{method:"PATCH",body:JSON.stringify({status:"done"})}),e.state._goals=await e.api("/goals"),await e.refresh(),e.render()}catch(m){alert(m.message)}}async function s(c){let m=new FormData(c),o=(m.get("text")||"").toString().trim(),t=(m.get("due_at")||"").toString().trim();if(!o||!t)return;let a=t.length===16?`${t}:00`:t;try{await e.api("/reminders",{method:"POST",body:JSON.stringify({text:o,due_at:a})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.reminderFormOpen=!1),e.render(),c.reset()}catch(l){alert(l.message)}}async function u(c,m){if(await e.api(`/reminders/${c}`,{method:"PATCH",body:JSON.stringify({status:m}),timeoutMs:15e3}),e.state._goals=await e.api("/goals"),e.currentView==="goals"&&e.render(),e.currentView==="dashboard"){let o=e.currentWorldId(),t=o&&o!=="root"?`?world_id=${encodeURIComponent(o)}`:"";e.state._nudges=(await e.api(`/nudges${t}`).catch(()=>({nudges:[]}))).nudges||[],e.render()}}e.renderGoals=k,e.submitGoal=I,e.markGoalDone=g,e.submitReminder=s,e.updateReminderStatus=u}function Ae(e){function k(){let g=e.state._memoryResults||[],s=e.state._memoryFull||{},u=s.collections||[],c=s.knowledge_graph||{},m=g.map(t=>`<div class="memory-hit">
      <span class="badge-pill">${e.esc(t.collection)}</span>
      <p class="body-md" style="margin-top:var(--space-xxs);max-width:72ch">${e.esc(t.text)}</p></div>`).join(""),o=u.map(t=>`
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
      </div>`}async function I(){let g=e.$("#memory-q")?.value?.trim();if(e.state._memoryQ=g,!g)return;let s=await e.api("/memory/search?q="+encodeURIComponent(g));e.state._memoryResults=s.results,e.render()}e.renderMemory=k,e.searchMemory=I}function Le(e){function k(s){let u=s.content||"";return s.role==="agent"||s.role==="assistant"?`<div class="msg-md history-msg__body">${window.FOSMarkdown?.render?.(u)||e.esc(u)}</div>`:`<p class="body-md history-msg__body">${e.esc(u)}</p>`}function I(){let u=(e.state._history||{}).sessions||[],c=e.state._artifacts||[],m=e.state._historySession,o=e.historyTab,t=u.length?u.map(r=>`
      <button type="button" class="history-session${m?.id===r.id?" is-active":""}" data-history-session="${e.esc(r.id)}">
        <span class="history-session__title">${e.esc(r.title||"Conversation")}</span>
        <span class="history-session__meta muted">${e.esc(r.specialist||"supervisor")} \xB7 ${r.message_count||0} msgs \xB7 ${e.fmtHistoryTime(r.updated_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No conversations yet. Ask the agent something to start a session.</p>",a="<p class='body-md muted'>Select a conversation to view messages, runs, and linked documents.</p>";if(m?.messages?.length){let r=m.messages.map(A=>`
        <div class="history-msg history-msg--${e.esc(A.role)}">
          <span class="caption-uppercase">${e.esc(A.role)}</span>
          ${e.renderHistoryMessageContent(A)}
          <span class="muted" style="font-size:11px">${e.fmtHistoryTime(A.created_at)}</span>
        </div>`).join(""),h=(m.runs||[]).map(A=>`
        <article class="history-run">
          <div class="history-run__head">
            <span class="mono">${e.esc(A.specialist||A.actor||"agent")}</span>
            <span class="muted">${A.duration_s||0}s</span>
          </div>
          ${e.renderLiveFlow((A.tools||[]).map(v=>({name:v.name,decision:v.decision,t:v.t})),"No tools")}
          ${A.assistant_reply?`<div class="history-run__reply msg-md">${window.FOSMarkdown?.render?.(A.assistant_reply)||e.esc(A.assistant_reply)}</div>`:""}
        </article>`).join("")||"",O=(m.artifacts||[]).map(A=>`
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
        ${h?`<p class="caption-uppercase" style="margin-top:var(--space-md)">Runs</p>${h}`:""}
        <p class="caption-uppercase" style="margin-top:var(--space-md)">Documents</p>
        <div class="history-artifacts">${O}</div>`}let l=c.length?c.map(r=>`
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
      </div>`:`<section class="driver-card history-documents-grid">${l}</section>`}`}async function g(s){e.state._historySelectedId=s;try{e.state._historySession=await e.api(`/history/sessions/${s}`)}catch{e.state._historySession=null}e.render()}e.renderHistoryMessageContent=k,e.renderHistory=I,e.loadHistorySession=g}function Re(e){function k(){let g=e.state.approvals||[];return g.length?`<section class="driver-card">${g.map(s=>`
      <div class="approval-block">
        <div class="approval-meta caption-uppercase"><span class="mono">#${s.id}</span> \xB7 ${e.esc(s.tool_name)}</div>
        <div class="approval-summary body-md">${e.esc(s.summary)}</div>
        <div class="approval-actions">
          <button type="button" class="button-primary button-sm" data-approve="${s.id}">Approve</button>
          <button type="button" class="button-outline-on-dark button-sm" data-reject="${s.id}">Reject</button>
        </div>
      </div>`).join("")}</section>`:'<section class="driver-card empty-state"><p class="title-sm">No pending approvals</p></section>'}async function I(g,s){try{let u=await e.api(`/approvals/${g}/${s?"approve":"reject"}`,{method:"POST"});e.chatHistory.push({role:"system",text:u.result}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.refresh(),e.currentView==="approvals"&&e.render()}catch(u){alert(u.message)}}e.renderApprovals=k,e.decideApproval=I}function Oe(e){function k(){let I=e.state._tools||{},g=(I.tools||[]).map(s=>`<div class="tool-row">
      <div class="name">${e.esc(s.name)}${s.requires_approval?' <span class="badge-pill">approval</span>':""}</div>
      <div class="cat">${e.esc(s.category)}</div>
      <div class="desc">${e.esc(s.description)}</div></div>`).join("");return`<p class="body-md" style="margin-bottom:var(--space-xs);max-width:60ch">${I.total||0} tools \xB7 ${Object.keys(I.by_category||{}).length} categories. Tool-RAG retrieves the most relevant set per message.</p>
    <div class="tool-list">${g}</div>`}e.renderTools=k}function Te(e){function k(){let I=e.state._activity?.traces_full||[],g=e.state._activity?.actions||e.state.actions||[],s=I.length?I.map(c=>`
      <article class="trace-card">
        <div class="trace-card-head">
          <span class="mono">${e.esc(c.actor)}</span>
          <span class="muted">${c.duration_s}s</span>
        </div>
        <p class="message">${e.esc(c.message)}</p>
        ${e.renderLiveFlow(c.events,"No tools in this turn")}
        ${c.final?`<p class="world-meta" style="margin-top:var(--space-xs)">\u2192 ${e.esc(c.final)}</p>`:""}
      </article>`).join(""):"<p class='body-md muted'>No agent turns logged today. Send a message in Chat to see the decision flow here.</p>",u=g.slice(0,20).map(c=>`<div class="activity-row">
      <div class="mono">${e.esc(c.tool_name)}</div>
      <div class="meta">${e.esc(c.actor)} \xB7 ${e.esc((c.created_at||"").slice(0,16))}</div></div>`).join("")||"<p class='muted'>No actions logged.</p>";return`<div class="dashboard-grid">
      <section class="driver-card span-8"><p class="caption-uppercase">Decision flow</p><div style="margin-top:var(--space-sm)">${s}</div></section>
      <section class="driver-card span-4"><p class="caption-uppercase">Tool log</p><div style="margin-top:var(--space-sm)">${u}</div></section>
    </div>`}e.renderActivity=k}function De(e){function k(){let o=e.state._infraHealth;if(!o)return`<section class="driver-card span-12">
        <div class="infra-health-head">
          <p class="caption-uppercase">Infrastructure</p>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Check health</button>
        </div>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Monitor EC2 host, S3 vault bucket, and disk on this server.</p>
      </section>`;let t=o.host||{},a=o.s3||{},l=o.disk||{},r=o.app||{},h=t.platform==="ec2"?e.infraKvRow("Instance",t.instance_id,!0)+e.infraKvRow("Region",t.region)+e.infraKvRow("Type",t.instance_type)+e.infraKvRow("IAM role",t.iam_role):e.infraKvRow("Host","Local / dev"),O=a.configured?e.infraKvRow("Bucket",a.bucket,!0)+e.infraKvRow("Region",a.region)+e.infraKvRow("Read/write",a.read_write_ok?"OK":a.reachable?"Reachable only":"Failed"):e.infraKvRow("Storage","Local disk only"),A=e.infraKvRow("Data path",l.path,!0)+e.infraKvRow("Free",l.free_gb!=null?`${l.free_gb} GB`:null)+e.infraKvRow("Used",l.used_pct!=null?`${l.used_pct}%`:null),v=!!o.ok;return`<section class="driver-card span-12">
      <div class="infra-health-head">
        <div>
          <p class="caption-uppercase">Infrastructure</p>
          <p class="world-meta">Last checked ${e.esc(e.fmtTime(o.checked_at)||o.checked_at||"\u2014")} \xB7 App storage: <strong>${e.esc(r.storage_backend||"\u2014")}</strong></p>
        </div>
        <div class="infra-health-head__actions">
          <span class="badge-pill${v?" badge-pill--ok":" badge-pill--warn"}">${v?"All checks passed":"Needs attention"}</span>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Refresh</button>
        </div>
      </div>
      <div class="infra-health-grid">
        ${e.infraHealthCard("EC2 host",t.ok!==!1,h,t.detail)}
        ${e.infraHealthCard("S3 vault",a.configured?!!a.ok:!0,O,a.detail)}
        ${e.infraHealthCard("Disk",!!l.ok,A,l.detail)}
      </div>
    </section>`}function I(){let o=e.state.config||{},t=o.integrations||{},a=e.state._whatsapp||{},l=(o.autonomy_level||"balanced").toLowerCase(),r=o.whatsapp_enabled?a.connected?`Connected${a.linked_phone?` (${e.esc(a.linked_phone)})`:""}`:a.qr_pending?"Scan QR below":"Bridge not connected":"Disabled in .env",h=a.qr_data_url?`<img src="${a.qr_data_url}" alt="WhatsApp QR code" width="280" height="280" style="margin-top:var(--space-sm);border-radius:8px">`:"",O=o.agent_paused?'<button type="button" class="button-primary" id="toggle-pause">Resume agent</button>':'<button type="button" class="button-outline-on-dark" id="toggle-pause">Pause agent</button>';return`<div class="dashboard-grid settings-page">
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
                <option value="cautious"${l==="cautious"?" selected":""}>Cautious \u2014 ask before most actions</option>
                <option value="balanced"${l==="balanced"?" selected":""}>Balanced \u2014 routine tools auto-run</option>
                <option value="autonomous"${l==="autonomous"?" selected":""}>Autonomous \u2014 minimal prompts</option>
              </select></label>
            <label class="human-field human-field--checkbox">
              <input type="checkbox" name="auto_approve" value="1"${o.auto_approve?" checked":""}>
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
        ${h}
        <p class="caption muted" style="margin-top:var(--space-xs)">Open WhatsApp \u2192 Linked devices \u2192 Link a device. QR refreshes every few seconds while pending.</p>
      </section>`:""}
    </div>`}function g(){e.whatsappPollTimer&&(clearInterval(e.whatsappPollTimer),e.whatsappPollTimer=null)}async function s(){if(e.currentView!=="settings"){e.stopWhatsappPoll();return}try{let o=await e.api("/whatsapp/status");if(e.state._whatsapp={...e.state._whatsapp||{},...o},o.qr_pending){let t=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=t.qr_data_url||null}else e.state._whatsapp.qr_data_url=null;e.currentView==="settings"&&e.render({graphs:!1})}catch{}}function u(){e.stopWhatsappPoll();let o=e.state.config||{};e.currentView!=="settings"||!o.whatsapp_enabled||(e.pollWhatsappSettings(),e.whatsappPollTimer=setInterval(s,5e3))}async function c(){let o=document.getElementById("btn-infra-refresh");o&&(o.disabled=!0);try{e.state._infraHealth=await e.api("/infrastructure/health"),e.render(),e.afterRender()}catch(t){console.error("Infrastructure health check failed:",t)}finally{o&&(o.disabled=!1)}}async function m(o){let t=new FormData(o);try{let a=await e.api("/agent/config",{method:"POST",body:JSON.stringify({autonomy_level:(t.get("autonomy_level")||"balanced").toString(),auto_approve:t.get("auto_approve")==="1"})});e.state.config={...e.state.config||{},...a},e.updateStatus(),e.render()}catch(a){alert(a.message)}}e.renderInfrastructureHealth=k,e.renderSettings=I,e.stopWhatsappPoll=g,e.pollWhatsappSettings=s,e.startWhatsappPollIfNeeded=u,e.refreshInfraHealth=c,e.saveAgentConfig=m}function Pe(e){function k(v){let y={name:"",dirs:{},files:[]};for(let L of v){let D=L.github_path||L.filename||L.title||"file",F=D.split("/").filter(Boolean),w=F.pop()||D,$=y;for(let M of F)$.dirs[M]||($.dirs[M]={name:M,dirs:{},files:[]}),$=$.dirs[M];$.files.push({...L,_fileName:w})}return y}function I(){return document.hidden?e.LIVE_POLL_HIDDEN_MS:e.LIVE_POLL_MS}function g(){e.livePollTimer&&clearTimeout(e.livePollTimer),e.livePollTimer=setTimeout(async()=>{await e.pollLive(),e.scheduleLivePoll()},e.livePollDelayMs())}function s(v){return e.WORLD_KINDS[v]||e.WORLD_KINDS.project}function u(v){let y=e.worldKindMeta(v||"project");return`<span class="world-kind-badge ${y.cls}">${e.esc(y.label)}</span>`}function c(){return e.state._worldFull?.worlds||e.state.worlds||{}}function m(v){e.currentView==="world"&&e.inspectorWorldId()===v?e.patchWorldPanels():e.currentView==="agents"&&e.currentWorldId()===v?e.patchAgentsVaultPanel():e.render({graphs:!1})}function o(){return(e.state._worldVault?.storage_backend||e.state._worldVault?.vault?.storage_backend)==="s3"?"S3":"local object storage"}function t(v){let y=Number(v)||0;return y<1024?`${y} B`:y<1048576?`${(y/1024).toFixed(1)} KB`:`${(y/1048576).toFixed(1)} MB`}function a(v){if(!v)return"";let y=typeof v=="number"?new Date(v*1e3):new Date(v);return Number.isNaN(y.getTime())?String(v).slice(0,16):y.toLocaleString()}function l(v,y,L=!1){let D=y==null||y===""?"\u2014":String(y);return`<div class="infra-kv"><dt>${e.esc(v)}</dt><dd${L?' class="infra-kv__val"':""}>${e.esc(D)}</dd></div>`}function r(v,y,L,D){let F=y?"Healthy":"Issue";return`<div class="integration-card infra-health-card${y?" is-connected":" is-warning"}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(v)}</span>
        <span class="integration-card__status">${F}</span>
      </div>
      <dl class="infra-kv-list">${L}</dl>
      ${D?`<p class="integration-card__detail">${e.esc(D)}</p>`:""}
    </div>`}function h(v,y,L){return`<div class="integration-card${y?" is-connected":""}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(v)}</span>
        <span class="integration-card__status">${y?"Active":"Not configured"}</span>
      </div>
      <p class="integration-card__detail">${e.esc(L)}</p>
    </div>`}async function O(v){let y=v.target.files?.[0];if(!y)return;let L=new FormData;L.append("file",y),e.chatHistory.push({role:"user",text:`\u{1F4CE} Uploaded: ${y.name}`}),e.render();try{L.append("world_id",e.currentWorldId());let D=await fetch("/api/upload",{method:"POST",body:L,credentials:"same-origin"}),F=await D.json().catch(()=>({}));if(D.status===401&&F.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!D.ok)throw new Error(F.error||D.statusText);e.chatHistory.push({role:"agent",text:F.reply})}catch(D){e.chatHistory.push({role:"system",text:"Upload failed: "+D.message})}localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),v.target.value="",e.render()}function A(){let v=document.querySelector(".app"),y=e.$("#btn-sidebar-collapse"),L="fos_sidebar_collapsed";localStorage.getItem(L)==="1"&&v?.classList.add("sidebar-collapsed");let D=()=>{let F=v?.classList.contains("sidebar-collapsed");y?.setAttribute("aria-label",F?"Expand sidebar":"Collapse sidebar"),y?.setAttribute("title",F?"Expand sidebar":"Collapse sidebar")};D(),y?.addEventListener("click",()=>{v?.classList.toggle("sidebar-collapsed"),localStorage.setItem(L,v?.classList.contains("sidebar-collapsed")?"1":"0"),D()})}e.buildGithubPathTree=k,e.livePollDelayMs=I,e.scheduleLivePoll=g,e.worldKindMeta=s,e.worldKindBadge=u,e.worldTreeData=c,e.afterVaultMutation=m,e.vaultStorageLabel=o,e.formatBytes=t,e.fmtHistoryTime=a,e.infraKvRow=l,e.infraHealthCard=r,e.integrationCard=h,e.uploadFile=O,e.initSidebarCollapse=A}function We(e){async function k(u){if(u==="crm"&&await e.loadCrmData(),u==="outreach"&&await e.loadOutreachData(),u==="settings"&&(e.state._whatsapp=await e.api("/whatsapp/status").catch(()=>({})),e.state._whatsapp.qr_pending)){let c=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=c.qr_data_url||null}if(u==="goals"&&(e.state._goals=await e.api("/goals")),u==="tools"&&(e.state._tools=await e.api("/tools")),u==="agents"){let[c,m,o,t,a]=await Promise.all([e.api("/agents"),e.api("/activity").catch(()=>({})),e.api("/agents/runs").catch(()=>({runs:[],actions:[]})),e.api("/crm/contacts").catch(()=>({})),e.api("/tools").catch(()=>({}))]);e.state._agents=c,e.state._agents?.specialists?.length||(e.state._agents={...e.state._agents,specialists:e.DEFAULT_SPECIALISTS}),e.state._activity=m,e.state._agentRunsApi=o.runs||[],e.state._agentActions=o.actions||m.actions||[],e.state._crm=t,e.state._tools=a;let l=e.currentWorldId();l&&l!=="root"?await e.ensureVaultForWorld(l):e.clearVaultScopedState()}if(u==="settings"&&(e.state._infraHealth=await e.api("/infrastructure/health").catch(()=>e.state._infraHealth||null)),u==="activity"&&(e.state._activity=await e.api("/activity")),u==="history"){let c=e.currentWorldId(),m=c&&c!=="root"?`?world_id=${encodeURIComponent(c)}`:"";e.state._history=await e.api(`/history${m}`).catch(()=>({sessions:[],recent_runs:[]})),e.state._artifacts=(await e.api(`/artifacts${m}`).catch(()=>({artifacts:[]}))).artifacts||[],e.state._historySelectedId?e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null):e.state._history.sessions?.[0]&&(e.state._historySelectedId=e.state._history.sessions[0].id,e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null))}if(u==="documents")if(e.state._artifacts=(await e.api("/artifacts?limit=100").catch(()=>({artifacts:[]}))).artifacts||[],e.state._documentsSelectedId)try{let c=await e.api(`/artifacts/${e.state._documentsSelectedId}/content`,{timeoutMs:15e3});e.state._documentDraft=c.content||""}catch{e.state._documentDraft=""}else e.state._documentDraft="";if(u==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldGraph=e.state._worldFull?.graph??null,e.state._worldHierarchyGraph=e.state._worldFull?.hierarchy_graph??null,e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.invalidateGraphCache("graph-world"),e.state._worldTemplates?.length||(e.state._worldTemplates=(await e.api("/world-templates").catch(()=>({}))).templates||[]),e.state.inspectorWorldId||(e.state.inspectorWorldId=e.currentWorldId()),e.state._githubStatus=await e.api("/github/status").catch(()=>({})),e.state._githubStatus?.connected?e.state._githubRepos=(await e.api("/github/repos").catch(()=>({}))).repos||[]:e.state._githubRepos=[],await e.ensureVaultForWorld(e.inspectorWorldId()),await e.resumeActiveSyncJobs(e.inspectorWorldId())),u==="memory"&&(e.state._memoryFull=await e.api("/graph/memory"),e.state._memoryGraph=e.state._memoryFull?.graph??null,e.invalidateGraphCache("graph-memory")),(u==="dashboard"||u==="chat"||u==="agents")&&(e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})))),u==="chat"){e.state._activity=await e.api("/activity").catch(()=>e.state._activity||{}),e.state._agentRunsApi=(await e.api("/agents/runs").catch(()=>({}))).runs||e.state._agentRunsApi,await e.loadChatSessionsList(),await e.loadChatFromServer();let c=e.currentWorldId();c&&c!=="root"&&await e.ensureVaultForWorld(c)}if(u==="dashboard"){e.state._world=await e.api("/world").catch(()=>e.state._world||{}),e.state._worldGraph=e.state._world?.graph??e.state._worldGraph??null,e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})));let c=e.currentWorldId(),m=c&&c!=="root"?`?world_id=${encodeURIComponent(c)}`:"";e.state._nudges=(await e.api(`/nudges${m}`).catch(()=>({nudges:[]}))).nudges||[]}["dashboard","agents","chat","world","memory"].includes(u)&&await e.loadGraphData()}async function I(u=!1){let c=e.state.activeWorldId,m=e.state.selectedSpecialist,o=e.state.ui;if(u||!e.state.config?.my_name)e.state={...e.state,...await e.api("/state")};else{let t=await e.api("/summary");e.state.usage=t.usage??e.state.usage,e.state.unread_notifications=t.unread_notifications??e.state.unread_notifications,t.worlds&&(e.state.worlds=t.worlds),t.config&&(e.state.config=t.config),e.state.snapshot={...e.state.snapshot||{},approvals_pending:t.approvals_pending??e.state.snapshot?.approvals_pending??0,reminders_pending:t.reminders_pending??e.state.snapshot?.reminders_pending??0,tasks_open:t.tasks_open??e.state.snapshot?.tasks_open??0,crm:{...e.state.snapshot?.crm||{},followups_due:t.crm_followups_due??e.state.snapshot?.crm?.followups_due??0}}}e.state.activeWorldId=c||e.state.activeWorldId||"root",e.state.selectedSpecialist=m??e.state.selectedSpecialist??"",e.state.ui=o||e.state.ui;try{e.populateWorldSelect(),e.populateSpecialistSelect()}catch(t){console.error("populate selects failed:",t)}e.updateBadges(),e.updateStatus(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function g(){}function s(){e.refreshTimer&&clearTimeout(e.refreshTimer),!document.hidden&&(e.refreshTimer=setTimeout(async()=>{try{await e.refresh(!1),e.updateBadges(),e.updateStatus()}catch(u){console.error(u),e.setConnectionStatus("Reconnecting\u2026","paused")}e.scheduleBackgroundRefresh()},e.REFRESH_MS))}e.loadViewData=k,e.refresh=I,e.loadBootExtras=g,e.scheduleBackgroundRefresh=s}function Ee(e){function k(){return window.FOS_MOBILE_PRIMARY_VIEWS||new Set(["dashboard","chat","agents","world"])}function I(){document.getElementById("sidebar")?.classList.remove("is-open"),document.body.classList.remove("mobile-nav-open");let r=document.getElementById("sidebar-backdrop");r&&(r.classList.remove("is-visible"),r.setAttribute("hidden","")),document.getElementById("mobile-menu-drawer")?.close?.()}function g(){let r=document.getElementById("sidebar"),h=document.getElementById("sidebar-backdrop");!r||!h||(r.classList.add("is-open"),document.body.classList.add("mobile-nav-open"),h.removeAttribute("hidden"),requestAnimationFrame(()=>h.classList.add("is-visible")))}function s(r){let h=e.mobilePrimaryViews();document.querySelectorAll(".mobile-tab").forEach(O=>{let A=O.dataset.mobileView;A==="more"?O.classList.toggle("is-active",!h.has(r)):O.classList.toggle("is-active",A===r)}),document.querySelectorAll(".mobile-menu-link").forEach(O=>{O.classList.toggle("is-active",O.dataset.view===r)})}function u(r,h={}){let O=h.params??(r===e.currentView?e.routeParams:{})??{};h.skipUrl?e.applyRouteParams(r,O):e.updateRoute(r,O,{replace:!!h.replace}),e.currentView=r,r!=="outreach"&&e.state._crmOutreachPollId&&(clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null),e.$$(".nav button").forEach(v=>v.classList.toggle("is-active",v.dataset.view===r)),e.$("#view-title").textContent=e.TITLES[r]||r,e.syncMobileNav(r),e.closeMobileShell(),FOSMotion?.animateTopbarTitle?.(),["dashboard","agents","chat","activity","world"].includes(r)?e.startLivePoll():e.stopLivePoll();let A=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1}),e.loadViewData(r).then(()=>{A===e.viewDataLoadGen&&(e.setViewLoading(!1),e.render())}).catch(v=>{console.error(v),A===e.viewDataLoadGen&&e.setViewLoading(!1)})}function c(r={}){try{e.currentView==="dashboard"&&e.drawDashboardCharts()}catch(v){console.warn("dashboard charts skipped:",v)}try{r.graphs!==!1&&e.drawGraphs()}catch(v){console.warn("graphs skipped:",v)}e.state._motionSkipOnce?e.state._motionSkipOnce=!1:FOSMotion?.runView?.(e.currentView),FOSMotion?.ensureContentVisible?.();let h=document.getElementById("content"),O=window.FOSMarkdown?.enhance?.(h),A=()=>{(e.currentView==="chat"||e.currentView==="agents")&&e.initMsgReadMore(h)};if(O?.then?O.then(A).catch(A):A(),e.currentView==="documents"&&!e.documentsEditMode){let v=e.$("#docs-preview");v&&window.FOSMarkdown?.renderInto?.(v,e.state._documentDraft??"")}e.startWhatsappPollIfNeeded()}function m(){let r=(e.state.approvals||[]).length,h=e.$("#nav-approval-badge");h&&(h.textContent=r,h.hidden=!r);let O=e.$("#mobile-approval-badge");O&&(O.textContent=r,O.hidden=!r);let A=e.$("#mobile-menu-approval-badge");A&&(A.textContent=r,A.hidden=!r);let v=e.state.unread_notifications||0,y=e.$("#notif-badge");y&&(y.textContent=v,y.hidden=!v)}function o(r,h="ok"){let O=e.$("#status-dot"),A=e.$("#status-text"),v=e.$("#mobile-status-dot"),y=e.$("#mobile-status-text");A&&(A.textContent=r),y&&(y.textContent=r),O?.classList.toggle("ok",h==="ok"),O?.classList.toggle("paused",h!=="ok"),v?.classList.toggle("ok",h==="ok"),v?.classList.toggle("paused",h!=="ok")}function t(){let r=e.state.config||{};r.agent_paused?e.setConnectionStatus("Agent paused","paused"):e.setConnectionStatus("Online","ok");let h=e.$("#brand-sub");h&&(h.textContent=r.my_name||r.company_name||e.APP_NAME),document.title=r.my_name?`${e.APP_NAME} \u2014 ${r.my_name}`:e.APP_NAME}async function a(r,h){h&&(await e.api(`/notifications/${encodeURIComponent(h)}/read`,{method:"POST"}).catch(()=>{}),await e.refresh(),e.updateBadges()),r==="approvals"?e.goView("approvals"):r==="crm"?e.goView("crm"):r==="outreach"?e.goView("outreach"):r==="goals"?e.goView("goals"):r==="chat"?e.goView("chat"):e.goView(r||"dashboard"),e.$("#notif-drawer")?.close()}function l(){let r=e.state.notifications||[];e.$("#notif-list").innerHTML=r.length?r.map(h=>{let O=h.meta?.action||(h.kind==="approval"?"approvals":h.kind==="agent"?"chat":""),A=O?`<button type="button" class="button-outline-on-dark button-sm" data-notif-action="${e.esc(O)}" data-notif-id="${e.esc(h.id)}" style="margin-top:8px">Open</button>`:"",v=h.meta?.url,y=!A&&v?`<a class="button-outline-on-dark button-sm" href="${e.esc(v)}" target="_blank" rel="noopener" style="margin-top:8px;display:inline-block">Open</a>`:"";return`
      <div class="notif-item ${h.read?"":"unread"}" data-notif-id="${e.esc(h.id)}">
        <div class="title">${e.esc(h.title)}</div>
        <div class="body">${e.esc(h.body)}</div>
        <div class="muted" style="font-size:11px;margin-top:4px">${e.fmtTime(h.ts)}</div>
        ${A||y}
      </div>`}).join(""):"<p class='muted'>No notifications yet.</p>"}e.mobilePrimaryViews=k,e.closeMobileShell=I,e.openSidebar=g,e.syncMobileNav=s,e.goView=u,e.afterRender=c,e.updateBadges=m,e.setConnectionStatus=o,e.updateStatus=t,e.openNotificationAction=a,e.renderNotifications=l}function Me(e){function k(){let I=document.getElementById("content");!I||I.dataset.delegation==="1"||(I.dataset.delegation="1",I.addEventListener("click",g=>{let s=g.target.closest("[data-operator],[data-toggle-ui],[data-goto],[data-approve],[data-reject],[data-select-specialist],[data-agents-tab],[data-toggle-run],[data-memory-tab],[data-inspect-world],[data-world-graph-tab],[data-use-world],[data-set-active-world],[data-edit-world],[data-cancel-edit],[data-delete-world],[data-vault-ingest],[data-vault-link],[data-vault-search],[data-vault-facet],[data-vault-add-doc],[data-vault-cancel-doc],[data-vault-edit-doc],[data-vault-delete-doc],[data-vault-view-doc],[data-vault-reload],[data-github-add],[data-github-sync],[data-github-unlink],[data-goal-done],[data-history-tab],[data-history-session],[data-open-chat-session],[data-new-chat-session],[data-chat-session],[data-cancel-job],[data-cancel-active-job],[data-md-artifact],[data-open-document],[data-select-document],[data-docs-action],[data-tag-vault-doc],[data-nudge-index],[data-remove-attachment],[data-open-vault-picker],[data-pick-vault-doc],[data-crm-followup],[data-crm-wa-thread],[data-crm-tab],[data-crm-company-detail],[data-crm-company-close],[data-crm-import-companies],[data-crm-reload],[data-crm-outreach-start],[data-crm-campaign],[data-crm-draft-approve],[data-crm-draft-skip],[data-crm-company-toggle],[data-crm-skip-company],[data-crm-outreach-refresh],[data-crm-outreach-back],[data-outreach-open-crm-companies],[data-msg-read-more],#chat-send,#chat-clear,#memory-search,#toggle-pause,#agents-vault-search,#delegate-selected-btn,#btn-logout,#btn-infra-refresh");if(!s)return;let u=()=>{if(s.dataset.msgReadMore){e.state._msgExpand||(e.state._msgExpand={});let c=s.dataset.msgReadMore;e.state._msgExpand[c]=(e.state._msgExpand[c]||0)+1,e.initMsgReadMore(s.closest(".msg-read-more-host")||I);return}if(s.id==="chat-send")return e.sendChat();if(s.id==="chat-clear")return e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.setChatSessionId(null),e.render();if(s.id==="memory-search")return e.searchMemory();if(s.id==="toggle-pause")return e.togglePause();if(s.id==="agents-vault-search")return e.agentsVaultSearch();if(s.id==="delegate-selected-btn")return e.delegateAgent();if(s.id==="btn-logout")return e.logoutPin();if(s.id==="btn-infra-refresh")return e.refreshInfraHealth();if(s.dataset.operator)return e.openOperatorAction(s.dataset.operator);if(s.dataset.toggleUi)return e.state.ui||(e.state.ui={}),e.state.ui[s.dataset.toggleUi]=!e.state.ui[s.dataset.toggleUi],e.render();if(s.dataset.goto)return e.goView(s.dataset.goto);if(s.dataset.approve)return e.decideApproval(s.dataset.approve,!0);if(s.dataset.reject)return e.decideApproval(s.dataset.reject,!1);if(s.dataset.selectSpecialist!==void 0)return e.selectSpecialist(s.dataset.selectSpecialist||"");if(s.dataset.agentsTab){e.state.agentsTab=s.dataset.agentsTab,localStorage.setItem("fos_agents_tab",e.state.agentsTab),e.render(),e.state.agentsTab==="vault"?e.onWorldContextChanged({vaultWorldId:e.currentWorldId(),forceVault:!1}).then(()=>e.patchAgentsVaultPanel()):e.drawGraphs();return}if(s.dataset.toggleRun){let c=s.dataset.toggleRun;return e.state.expandedRunId=e.state.expandedRunId===c?null:c,e.render()}if(s.dataset.memoryTab)return e.memoryGraphTab=s.dataset.memoryTab,e.render({graphs:!1});if(s.dataset.inspectWorld)return e.selectInspectorWorld(s.dataset.inspectWorld);if(s.dataset.worldGraphTab)return e.switchWorldGraphTab(s.dataset.worldGraphTab);if(s.dataset.useWorld)return e.setActiveWorld(s.dataset.useWorld),e.goView("chat");if(s.dataset.setActiveWorld)return e.setActiveWorld(s.dataset.setActiveWorld),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.onWorldContextChanged({vaultWorldId:s.dataset.setActiveWorld,forceVault:!0}).then(()=>e.currentView==="world"?e.patchWorldPanels():e.render({graphs:!1}));if(s.dataset.editWorld)return e.state.worldEditing=s.dataset.editWorld,e.render();if(s.dataset.cancelEdit!==void 0)return e.state.worldEditing=null,e.render();if(s.dataset.deleteWorld)return e.deleteWorld(s.dataset.deleteWorld);if(s.dataset.vaultIngest)return e.vaultIngest(s.dataset.vaultIngest);if(s.dataset.vaultLink)return e.vaultLinkRepo(s.dataset.vaultLink);if(s.dataset.vaultSearch)return e.vaultSearch(s.dataset.vaultSearch);if(s.dataset.vaultReload)return e.reloadVaultFromServer(s.dataset.vaultReload);if(s.dataset.vaultFacet)return e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=s.dataset.vaultFacet,e.patchWorldPanels();if(s.dataset.vaultAddDoc!==void 0)return e.state.ui||(e.state.ui={}),e.state.ui.vaultDocForm=!0,e.state.ui.vaultDocEdit=null,e.patchWorldPanels();if(s.dataset.vaultCancelDoc!==void 0)return e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),e.patchWorldPanels();if(s.dataset.vaultEditDoc)return e.startVaultDocEdit(e.inspectorWorldId(),s.dataset.vaultEditDoc);if(s.dataset.vaultViewDoc){let c=s.dataset.worldId||e.inspectorWorldId(),m=s.dataset.vaultViewDoc;return m?e.openVaultDocViewer(c,m,s.dataset.docTitle||"Document"):void 0}if(s.dataset.tagVaultDoc)return e.tagVaultDocInChat(s.dataset.tagVaultDoc,s.dataset.worldId,s.dataset.docTitle,s.dataset.docPath);if(s.dataset.nudgeIndex!==void 0)return e.handleNudgeAction(s.dataset.nudgeIndex);if(s.dataset.removeAttachment!==void 0){let c=Number(s.dataset.removeAttachment);return Number.isNaN(c)||e.state._chatAttachments?.splice(c,1),e.render()}if(s.dataset.openVaultPicker!==void 0)return e.openVaultAttachPicker().catch(c=>alert(c.message));if(s.dataset.pickVaultDoc){e.tagVaultDocInChat(s.dataset.pickVaultDoc,s.dataset.worldId,s.dataset.docTitle,s.dataset.docPath),e.$("#vault-picker-dialog")?.close();return}if(s.dataset.crmTab)return e.state.ui||(e.state.ui={}),e.state.ui.crmTab=s.dataset.crmTab,localStorage.setItem("fos_crm_tab",e.state.ui.crmTab),e.loadCrmData().then(()=>e.render());if(s.dataset.crmOutreachRefresh!==void 0){let c=e.state.ui?.crmCampaignId;return c?e.pollCrmOutreachJob(c,!0):e.loadOutreachData().then(()=>e.render())}if(s.hasAttribute("data-outreach-open-crm-companies"))return e.state.ui||(e.state.ui={}),e.state.ui.crmTab="companies",localStorage.setItem("fos_crm_tab","companies"),e.goView("crm");if(s.dataset.crmCompanyDetail)return e.openCrmCompanyDetail(s.dataset.crmCompanyDetail);if(s.dataset.crmCompanyClose!==void 0)return e.state.ui&&(e.state.ui.crmCompanyDetail=null),e.state._crmCompanyDetail=null,e.render();if(s.dataset.crmImportCompanies!==void 0)return e.importCrmCompaniesFromContacts();if(s.dataset.crmReload!==void 0)return e.loadCrmData().then(()=>e.render());if(s.dataset.crmFollowup)return e.scheduleCrmFollowup(s.dataset.crmFollowup,s.dataset.followupDays);if(s.dataset.crmWaThread)return e.loadCrmWaThread(s.dataset.crmWaThread);if(s.dataset.crmCampaign)return e.openCrmCampaignReview(s.dataset.crmCampaign);if(s.hasAttribute("data-crm-outreach-back"))return e.closeCrmCampaignReview();if(s.dataset.crmDraftApprove)return e.approveCrmDraft(s.dataset.crmDraftApprove);if(s.dataset.crmDraftSkip)return e.skipCrmDraft(s.dataset.crmDraftSkip);if(s.dataset.crmSkipCompany)return e.skipCrmCompany(s.dataset.crmSkipCompany);if(s.dataset.reminderDone)return e.updateReminderStatus(s.dataset.reminderDone,"done");if(s.dataset.reminderCancel)return e.updateReminderStatus(s.dataset.reminderCancel,"cancelled");if(s.dataset.notifAction)return e.openNotificationAction(s.dataset.notifAction,s.dataset.notifId);if(s.dataset.vaultDeleteDoc)return e.deleteVaultDoc(e.inspectorWorldId(),s.dataset.vaultDeleteDoc);if(s.dataset.githubAdd)return e.connectGithubRepo(s.dataset.githubAdd);if(s.dataset.githubSync)return e.syncGithubRepo(s.dataset.worldId,s.dataset.githubSync);if(s.dataset.githubUnlink)return e.unlinkGithubRepo(s.dataset.worldId,s.dataset.githubUnlink);if(s.dataset.goalDone)return e.markGoalDone(s.dataset.goalDone);if(s.dataset.historyTab)return e.historyTab=s.dataset.historyTab,localStorage.setItem("fos_history_tab",e.historyTab),e.render();if(s.dataset.historySession)return e.loadHistorySession(s.dataset.historySession);if(s.dataset.openChatSession)return e.setChatSessionId(s.dataset.openChatSession),e.loadChatFromServer().then(()=>e.goView("chat"));if(s.hasAttribute("data-new-chat-session"))return e.setChatSessionId(null),e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.loadChatSessionsList().then(()=>{e.currentView==="chat"?e.render():e.goView("chat")});if(s.dataset.chatSession)return e.setChatSessionId(s.dataset.chatSession),e.loadChatFromServer().then(()=>e.render());if(s.dataset.cancelJob)return e.cancelActiveJob(s.dataset.cancelJob);if(s.dataset.cancelActiveJob!==void 0)return e.cancelActiveJob();if(s.dataset.openDocument)return e.openDocumentsWorkspace(Number(s.dataset.openDocument));if(s.dataset.mdArtifact)return e.openDocumentsWorkspace(Number(s.dataset.mdArtifact));if(s.dataset.selectDocument)return e.selectDocument(s.dataset.selectDocument);if(s.dataset.docsAction){let c=s.dataset.docsAction;if(c==="new")return e.createNewDocument().catch(m=>alert(m.message));if(c==="toggle")return e.documentsEditMode&&(e.state._documentDraft=document.getElementById("docs-source")?.value??e.state._documentDraft),e.documentsEditMode=!e.documentsEditMode,e.render();if(c==="save")return e.saveCurrentDocument().catch(m=>alert(m.message));if(c==="memory")return e.saveDocumentToMemory().catch(m=>alert(m.message))}};return e.shouldSkipActionBusy(s)?u():e.runWithActionBusy(u,s)}),I.addEventListener("submit",g=>{let s=g.target;if(!(s instanceof HTMLFormElement))return;let u={"world-create-form":e.createWorldFromForm,"crm-create-form":e.submitCrmContact,"crm-company-form":e.submitCrmCompany,"crm-outreach-form":e.submitCrmOutreach,"goal-create-form":e.submitGoal,"reminder-create-form":e.submitReminder,"agent-config-form":e.saveAgentConfig,"world-edit-form":e.saveWorldEdit,"vault-doc-form":e.submitVaultDoc};if(u[s.id]){g.preventDefault();let c=s.querySelector('[type="submit"]');e.runWithActionBusy(()=>u[s.id](s),c)}}),I.addEventListener("change",g=>{if(g.target.id==="chat-file")return e.uploadFile(g);if(g.target.id==="docs-upload"){let s=g.target.files?.[0];s&&e.uploadDocumentFile(s).catch(u=>alert(u.message)),g.target.value="";return}if(g.target.id==="specialist-select-agents"||g.target.id==="chat-specialist-select")return e.selectSpecialist(g.target.value);if(g.target.id==="rag-mode-select"){e.state.ragMode=g.target.value||"auto",localStorage.setItem("fos_rag_mode",e.state.ragMode);return}if(g.target.matches("[data-crm-status]")&&e.updateCrmStatus(g.target.dataset.crmStatus,g.target.value),g.target.matches("[data-crm-whatsapp]")&&e.updateCrmWhatsapp(g.target.dataset.crmWhatsapp,g.target.checked),g.target.matches("[data-crm-company-toggle]")&&e.toggleCrmOutreachCompany(g.target),g.target.id==="crm-outreach-batch"){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachBatch=parseInt(g.target.value,10)||5;let s=e.state.ui.crmOutreachSelected||[];s.length>e.state.ui.crmOutreachBatch&&(e.state.ui.crmOutreachSelected=s.slice(0,e.state.ui.crmOutreachBatch)),e.render()}g.target.id==="crm-outreach-world"&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld=g.target.value,e.state.ui.crmOutreachSelected=[],e.loadOutreachData().then(()=>e.render()))}),I.addEventListener("blur",g=>{if(g.target.matches(".crm-draft-subject, .crm-draft-body")){let s=g.target.dataset.draftId;s&&e.saveCrmDraftEdits(s).catch(()=>{})}},!0),I.addEventListener("keydown",g=>{g.target.id==="chat-input"&&g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),e.sendChat()),g.target.id==="memory-q"&&g.key==="Enter"&&e.searchMemory()}),I.addEventListener("input",g=>{if(g.target.matches(".crm-draft-body[data-channel='whatsapp']")){let s=g.target.dataset.draftId,u=document.querySelector(`.crm-wa-count[data-draft-id="${s}"]`);u&&(u.textContent=`${g.target.value.length}/300`)}g.target.id==="delegate-selected"&&(e.state._delegateDraft=g.target.value)}))}e.initContentDelegation=k}function Ve(e){function k(s="rag-mode-select"){let u=e.RAG_MODES.map(c=>`<option value="${e.esc(c.id)}" title="${e.esc(c.hint)}">${e.esc(c.label)}</option>`).join("");return`<label class="chat-control">
      <span class="caption-uppercase">Retrieval</span>
      <select id="${e.esc(s)}" class="world-select agent-select" aria-label="RAG mode">${u}</select>
    </label>`}function I(){requestAnimationFrame(()=>{let s=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),u=s?.[s.length-1];FOSMotion?.animateNewMessage?.(u)})}function g(s={}){let u=e.$("#content");if(!u)return;let c={dashboard:e.renderDashboard,chat:e.renderChat,agents:e.renderAgents,world:e.renderWorld,approvals:e.renderApprovals,crm:e.renderCrm,outreach:e.renderOutreach,goals:e.renderGoals,memory:e.renderMemory,history:e.renderHistory,documents:e.renderDocuments,tools:e.renderTools,activity:e.renderActivity,settings:e.renderSettings};try{if(e.state._viewLoading)u.innerHTML=e.renderViewSkeleton(e.currentView);else{let o=c[e.currentView]||e.renderDashboard;u.innerHTML=o()}}catch(o){console.error("render failed:",o),u.innerHTML=`<div class="driver-card span-12">
        <p class="title-md">Dashboard could not render</p>
        <p class="body-md muted" style="margin-top:8px">${e.esc(o?.message||String(o))}</p>
        <button type="button" class="button-primary button-sm" id="render-retry" style="margin-top:12px">Retry</button>
      </div>`,e.$("#render-retry")?.addEventListener("click",()=>e.boot());return}document.querySelector(".content")?.classList.toggle("content--worlds",e.currentView==="world"),document.querySelector(".content")?.classList.toggle("content--wide",["agents","world","activity","chat","history","documents"].includes(e.currentView)),document.querySelector(".content")?.classList.toggle("content--chat",e.currentView==="chat"),e.populateSpecialistSelect();let m=e.$("#rag-mode-select");if(m&&(m.value=e.state.ragMode||"auto"),s.post!==!1&&(e.afterRender({graphs:s.graphs!==!1}),e.state._scrollWorldCreate&&e.currentView==="world"&&(e.state._scrollWorldCreate=!1,requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"})))),e.currentView==="chat"){let o=e.$("#chat-messages");o&&(o.scrollTop=o.scrollHeight)}}e.renderRagModeSelect=k,e.animateLatestChatMessage=I,e.render=g}function Fe(e){function k(t){console.error(`${e.APP_NAME} boot failed:`,t),e.setConnectionStatus("Offline","paused");let a=e.esc(t?.message||String(t));e.$("#content").innerHTML=`<div class="driver-card span-12">
      <p class="title-md">Could not connect to ${e.esc(e.APP_NAME)}</p>
      <p class="body-md muted" style="margin-top:8px">${a}</p>
      <p class="body-md muted" style="margin-top:12px">Make sure <code>python main.py</code> is running, then tap <strong>Refresh</strong> in the top bar.</p>
    </div>`}function I(t,a){let l=e.$("#pin-gate"),r=document.querySelector(".app"),h=e.$("#pin-error"),O=e.$("#pin-input");l&&(l.hidden=!1,l.classList.add("is-visible")),r&&r.setAttribute("inert",""),h&&(t?(h.textContent=t,h.hidden=!1):(h.hidden=!0,h.textContent="")),O&&!a&&(O.disabled=!1,O.focus()),O&&a&&(O.disabled=!0,h&&(h.textContent=`Too many attempts. Wait ${a}s.`,h.hidden=!1)),e.setConnectionStatus("Locked","paused")}function g(){let t=e.$("#pin-gate"),a=document.querySelector(".app");t&&(t.hidden=!0,t.classList.remove("is-visible")),a&&a.removeAttribute("inert")}async function s(){return(await fetch("/api/auth/status",{credentials:"same-origin",headers:{Accept:"application/json"}})).json()}function u(){window.__FOS_PIN_BOUND||(window.__FOS_PIN_BOUND=!0,e.$("#pin-form")?.addEventListener("submit",async t=>{t.preventDefault();let a=(e.$("#pin-input")?.value||"").trim(),l=e.$("#pin-error");if(!/^\d{6}$/.test(a)){l&&(l.textContent="Enter exactly 6 digits",l.hidden=!1);return}try{let r=await fetch("/api/auth/pin",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:a})}),h=await r.json().catch(()=>({}));if(!r.ok)throw new Error(h.error||"Incorrect PIN");e.hidePinGate(),e.$("#pin-input").value="",l&&(l.hidden=!0),await e.startApp()}catch(r){l&&(l.textContent=r.message,l.hidden=!1);let h=await e.fetchAuthStatus().catch(()=>({}));h.locked_seconds&&e.showPinGate(r.message,h.locked_seconds)}}),e.$("#pin-input")?.addEventListener("input",t=>{t.target.value=t.target.value.replace(/\D/g,"").slice(0,6)}))}function c(){e.resolveBootRoute();let t=new URLSearchParams(location.search),a=t.get("world");a&&(e.state.inspectorWorldId=a,e.setActiveWorld(a));let l=t.get("companies");if(l&&e.currentView==="outreach"){let r=l.split(",").map(h=>parseInt(h.trim(),10)).filter(Boolean);r.length&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=r),t.delete("companies")}if(t.get("github")==="connected"||t.get("github_error")){let r=t.get("github_error");r&&console.warn("GitHub auth:",r),t.delete("github"),t.delete("github_error");let h=location.pathname||"/",O=t.toString();history.replaceState({},"",h+(O?`?${O}`:""))}}async function m(){try{await e.refresh(!0)}catch(a){e.showBootError(a);return}e.applyBootUrlParams(),e.syncMobileNav(e.currentView);let t=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1});try{if(await e.loadViewData(e.currentView),t!==e.viewDataLoadGen)return;e.setViewLoading(!1),e.render()}catch(a){console.error(a),t===e.viewDataLoadGen&&e.setViewLoading(!1)}e.startLivePoll(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function o(){e.initContentDelegation(),e.initMdEditorDialog(),e.bindPinGate();let t=window.__FOS_AUTH;if(!t)try{t=await e.fetchAuthStatus()}catch(a){e.showBootError(a);return}if(t.pin_required&&!t.authenticated){e.showPinGate(null,t.locked_seconds||0);return}e.hidePinGate(),await e.startApp()}e.showBootError=k,e.showPinGate=I,e.hidePinGate=g,e.fetchAuthStatus=s,e.bindPinGate=u,e.applyBootUrlParams=c,e.startApp=m,e.boot=o}var re={dashboard:"/",chat:"/ask",agents:"/agents",world:"/worlds",crm:"/crm",outreach:"/outreach",goals:"/goals",memory:"/memory",documents:"/documents",history:"/history",approvals:"/approvals",tools:"/tools",activity:"/activity",settings:"/settings"},Ge=new Set(Object.keys(re)),Ne={"/chat":"chat","/control":"dashboard","/dashboard":"dashboard"},je=Object.fromEntries(Object.entries(re).map(([e,k])=>[e,k]));function ut(e){return!e||e==="/"?"/":e.replace(/\/+$/,"")||"/"}function oe(e){let k=ut(e),I=k.match(/^\/outreach\/campaigns\/(\d+)(?:\/review)?$/);if(I)return{view:"outreach",params:{campaignId:parseInt(I[1],10)}};if(k==="/outreach")return{view:"outreach",params:{}};if(Ne[k]){let g=Ne[k];return{view:g,params:{},redirect:je[g]}}for(let[g,s]of Object.entries(re))if(s===k)return{view:g,params:{}};return{view:"dashboard",params:{},redirect:"/"}}function se(e,k={}){return e==="outreach"&&k.campaignId?`/outreach/campaigns/${k.campaignId}`:je[e]||"/"}function Be(e){let k=!1;function I(o,t={}){e.routeParams={...t},o==="outreach"&&(e.state.ui||(e.state.ui={}),t.campaignId?e.state.ui.crmCampaignId=t.campaignId:(t.campaignId===null||t.campaignId===void 0)&&(t.keepCampaign||(e.state.ui.crmCampaignId=null)),t.companies?.length&&(e.state.ui.crmOutreachSelected=t.companies.map(Number).filter(Boolean)))}function g(o,t={},{replace:a=!1}={}){Ge.has(o)||(o="dashboard");let l=se(o,t),r=window.location.search||"",h=l+r,O=window.location.pathname+r;if(h!==O){let A={view:o,params:t};a?window.history.replaceState(A,"",h):window.history.pushState(A,"",h)}I(o,t)}function s({replace:o=!1}={}){let t=oe(window.location.pathname);if(t.redirect){let a=window.location.search||"";window.history.replaceState({view:t.view,params:t.params},"",t.redirect+a)}return I(t.view,t.params),e.currentView=t.view,t}function u(){return localStorage.getItem("fos_crm_tab")==="outreach"?(localStorage.removeItem("fos_crm_tab"),{view:"outreach",params:{}}):null}function c(){let o=new URLSearchParams(window.location.search),t=o.get("view");if(t&&Ge.has(t)){o.delete("view");let l=se(t,{}),r=o.toString(),h=l+(r?`?${r}`:"");return window.history.replaceState({view:t,params:{}},"",h),I(t,{}),e.currentView=t,{view:t,params:{}}}let a=u();if(a&&window.location.pathname==="/"){let l=window.location.search||"";return window.history.replaceState(a,"",se(a.view,a.params)+l),I(a.view,a.params),e.currentView=a.view,a}return s({replace:!0})}function m(){window.addEventListener("popstate",()=>{if(k)return;let o=oe(window.location.pathname);I(o.view,o.params),e.goView(o.view,{skipUrl:!0,params:o.params,fromPopstate:!0})})}e.routeParams={},e.pathToRoute=oe,e.routeToPath=se,e.updateRoute=g,e.syncRouteFromLocation=s,e.resolveBootRoute=c,e.applyRouteParams=I,e.initRouter=m,e._routerSuppressPopstate=o=>{k=o}}function He(e){e.$$(".nav button").forEach(m=>m.addEventListener("click",()=>e.goView(m.dataset.view))),e.$("#btn-sidebar-open")?.addEventListener("click",e.openSidebar);let k=document.querySelector(".app"),I=e.$("#btn-sidebar-collapse"),g="fos_sidebar_collapsed";localStorage.getItem(g)==="1"&&k?.classList.add("sidebar-collapsed");let s=()=>{let m=k?.classList.contains("sidebar-collapsed");I?.setAttribute("aria-label",m?"Expand sidebar":"Collapse sidebar"),I?.setAttribute("title",m?"Expand sidebar":"Collapse sidebar")};s(),I?.addEventListener("click",()=>{k?.classList.toggle("sidebar-collapsed"),localStorage.setItem(g,k?.classList.contains("sidebar-collapsed")?"1":"0"),s()}),e.$("#vault-picker-close")?.addEventListener("click",()=>e.$("#vault-picker-dialog")?.close()),e.$("#vault-picker-dialog")?.addEventListener("click",m=>{m.target.id==="vault-picker-dialog"&&e.$("#vault-picker-dialog").close()}),e.$("#sidebar-close")?.addEventListener("click",e.closeMobileShell),e.$("#sidebar-backdrop")?.addEventListener("click",e.closeMobileShell),document.querySelectorAll(".mobile-tab").forEach(m=>{m.addEventListener("click",()=>{let o=m.dataset.mobileView;o==="more"?(e.syncMobileNav(e.currentView),document.getElementById("mobile-menu-drawer")?.showModal()):e.goView(o)})}),document.querySelectorAll(".mobile-menu-link").forEach(m=>{m.addEventListener("click",()=>e.goView(m.dataset.view))});let u=e.$("#mobile-menu-drawer");e.$("#mobile-menu-close")?.addEventListener("click",()=>u?.close()),u?.addEventListener("click",m=>{m.target===u&&u.close()}),e.$("#btn-refresh")?.addEventListener("click",async()=>{await e.refresh();let m=++e.viewDataLoadGen;e.setViewLoading(!0);try{await e.loadViewData(e.currentView),m===e.viewDataLoadGen&&e.render()}finally{m===e.viewDataLoadGen&&e.setViewLoading(!1)}}),window.addEventListener("resize",()=>{window.innerWidth>900&&e.closeMobileShell()});let c=e.$("#notif-drawer");e.$("#btn-notifications")?.addEventListener("click",()=>{e.renderNotifications(),c?.showModal()}),c?.addEventListener("click",m=>{m.target===c&&c.close()}),e.$("#notif-read-all")?.addEventListener("click",async()=>{await e.api("/notifications/read-all",{method:"POST"}),await e.refresh(),e.renderNotifications(),e.updateBadges()}),e.$("#world-select")?.addEventListener("change",async m=>{let o=m.target,t=o.value||"root";o.disabled=!0;try{e.setActiveWorld(t),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.currentView==="world"&&(e.state.inspectorWorldId=t,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.patchWorldPanels()),await e.onWorldContextChanged({vaultWorldId:t,forceVault:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.state.agentsTab==="vault"?e.patchAgentsVaultPanel():e.render({graphs:!1}),e.updateWorldContextChrome()}catch(a){console.error("world switch failed:",a)}finally{o.disabled=!1}}),window.addEventListener("error",m=>{console.error("UI error:",m.error||m.message),e.state?.config?.my_name||e.setConnectionStatus("UI error \u2014 hard refresh","paused")}),document.addEventListener("visibilitychange",()=>{document.hidden?(e.refreshTimer&&(clearTimeout(e.refreshTimer),e.refreshTimer=null),e.stopLivePoll()):(e.scheduleBackgroundRefresh(),!e.livePollTimer&&e.state?.config&&e.startLivePoll())})}var H={};function mt(){ie(H),le(H),de(H),ce(H),ue(H),pe(H),me(H),he(H),fe(H),ge(H),be(H),ve(H),ye(H),we(H),_e(H),$e(H),Se(H),ke(H),Ce(H),Ie(H),Ae(H),Le(H),Re(H),Oe(H),Te(H),De(H),Pe(H),We(H),Ee(H),Me(H),Ve(H),Fe(H),Be(H)}mt();H.initRouter();He(H);window.__FOS=H;Object.defineProperty(window,"currentView",{get:()=>H.currentView,set:e=>{H.currentView=e}});window.drawGraphs=(...e)=>H.drawGraphs(...e);window.drawDashboardCharts=(...e)=>H.drawDashboardCharts(...e);window.render=(...e)=>H.render(...e);H.boot();H.scheduleBackgroundRefresh();
