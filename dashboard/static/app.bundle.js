var Ue=(e,S=document)=>S.querySelector(e),qe=(e,S=document)=>[...S.querySelectorAll(e)];function ie(e){e.$=Ue,e.$$=qe}function Je(e){let S=document.createElement("div");return S.textContent=e??"",S.innerHTML}function Ke(e){return"$"+Number(e||0).toLocaleString(void 0,{maximumFractionDigits:0})}function ze(e){return e?new Date(typeof e=="number"&&e<1e12?e*1e3:e).toLocaleString():""}function Ye(e){return new Promise(S=>setTimeout(S,e))}function le(e){e.esc=Je,e.fmtMoney=Ke,e.fmtTime=ze,e.sleep=Ye}function Qe(e,S){try{let k=localStorage.getItem(e);return k?JSON.parse(k):S}catch(k){return console.warn(`[storage] corrupt ${e}, resetting`,k),localStorage.removeItem(e),S}}function de(e){e.readJsonStorage=Qe}var Xe="Nawab OS",Ze=[{id:"pulse",label:"Pulse",role:"aggregator",tool_count:0,brief:"Operating pulse across parallel projects"},{id:"outreach",label:"Outreach",role:"outreach",tool_count:0,brief:"Outreach drafts and CRM pipeline"},{id:"leads",label:"Leads",role:"leads",tool_count:0,brief:"Lead lists and contact priorities"},{id:"market",label:"Market intel",role:"research",tool_count:0,brief:"Industry and competitor intelligence"},{id:"vault",label:"Vault",role:"knowledge",tool_count:0,brief:"Knowledge vault librarian"}],xe=[{id:"auto",label:"Auto",hint:"Agent picks retrieval"},{id:"hybrid",label:"Hybrid RAG",hint:"Dense + BM25 fusion"},{id:"graphrag",label:"GraphRAG",hint:"Knowledge graph communities"},{id:"vault",label:"Vault",hint:"World knowledge vault"},{id:"documents",label:"Documents",hint:"Ingested document store"}],et={dashboard:"Control center",chat:"Ask agent",agents:"Agent fleet",world:"Worlds",approvals:"Approvals",crm:"CRM & pipeline",outreach:"Outreach",goals:"Goals & tasks",memory:"Memory",documents:"Documents",history:"History",tools:"Tools",activity:"Activity",settings:"Settings"},tt=["prospect","contacted","replied","meeting","won","lost","nurture"],at=["prospect","contacted","responded","meeting_set","closed","dead"],st=["#f75440","#00666b","#03904a","#051f13","#5a403c","#8f706b","#e3beb8"],nt=15,ot=30,rt=5e3,it=3e4,lt=3e4,dt={aggregator:{label:"Aggregator",cls:"agent-role--aggregator",avatar:"agent-avatar--aggregator"},outreach:{label:"Outreach",cls:"agent-role--outreach",avatar:"agent-avatar--outreach"},leads:{label:"Leads",cls:"agent-role--leads",avatar:"agent-avatar--leads"},research:{label:"Intel",cls:"agent-role--research",avatar:"agent-avatar--research"},knowledge:{label:"Vault",cls:"agent-role--vault",avatar:"agent-avatar--knowledge"}},ct={supervisor:"SV",pulse:"PL",outreach:"OR",leads:"LD",market:"MK",vault:"VL"},ut={root:{label:"Main",cls:"world-kind--root"},project:{label:"Startup",cls:"world-kind--project"},startup:{label:"Startup",cls:"world-kind--project"},technical:{label:"Technical",cls:"world-kind--research"},idea:{label:"Idea",cls:"world-kind--idea"},research:{label:"Research",cls:"world-kind--research"}};function ce(e){Object.assign(e,{APP_NAME:Xe,DEFAULT_SPECIALISTS:Ze,RAG_MODES:xe,TITLES:et,CRM_STATUSES:tt,COMPANY_STATUSES:at,CHART_COLORS:st,MSG_READ_INITIAL_LINES:nt,MSG_READ_EXPAND_LINES:ot,LIVE_POLL_MS:rt,LIVE_POLL_HIDDEN_MS:it,REFRESH_MS:lt,AGENT_ROLES:dt,AGENT_INITIALS:ct,WORLD_KINDS:ut})}function ue(e){async function S(b,a,p="POST"){let u=await fetch("/api"+b,{method:p,body:a,credentials:"same-origin"}),m=await u.json().catch(()=>({}));if(u.status===401&&m.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!u.ok)throw new Error(m.error||u.statusText);return m}async function k(b,a={}){let p=new AbortController,u=a.timeoutMs??3e4,m=setTimeout(()=>p.abort(),u),{timeoutMs:n,headers:t,signal:s,...l}=a;try{let i=await fetch("/api"+b,{...l,credentials:"same-origin",headers:{"Content-Type":"application/json",...t||{}},signal:s||p.signal}),g=await i.json().catch(()=>({}));if(i.status===401&&g.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!i.ok)throw new Error(g.error||i.statusText);return g}catch(i){throw i.name==="AbortError"?new Error("Request timed out \u2014 is the server running?"):i}finally{clearTimeout(m)}}e.api=k,e.apiUpload=S}function pe(e){function S(){let k=localStorage.getItem("fos_selected_specialist");if(k!==null)return k;let b=localStorage.getItem("fos_selected_agent");return b&&b!=="supervisor"?b:""}e.state={live:{},selectedSpecialist:S(),ragMode:localStorage.getItem("fos_rag_mode")||"auto",activeWorldId:localStorage.getItem("fos_active_world")||"root",agentsTab:localStorage.getItem("fos_agents_tab")||"runs",expandedRunId:null,ui:{worldCreateOpen:!1,crmFormOpen:!1,goalsFormOpen:!1,reminderFormOpen:!1,vaultFacet:null,vaultDocForm:null,vaultDocEdit:null},_worldTemplates:null,_operations:{},_chatAttachments:[]},e.state._syncingLinkIds=new Set,e.currentView="dashboard",e.chatHistory=e.readJsonStorage("fos_chat",[]),e.historyTab=localStorage.getItem("fos_history_tab")||"conversations",e.documentsEditMode=!1,e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.livePollTimer=null,e._runtimePollTick=0,e.whatsappPollTimer=null,e.memoryGraphTab="graph",e.worldGraphTab="hierarchy",e.lastLiveActive=!1,e.viewDataLoadGen=0,e.vaultLoadGen=0,e.graphDrawCache={},e.actionBusyDepth=0,e.actionBusyButton=null,e.refreshTimer=null,e.loadSelectedSpecialist=S}function me(e){function S(){let l=e.state.config||{};return l.my_name?`${l.my_name}'s ${e.APP_NAME}`:e.APP_NAME}function k(){return e.state.activeWorldId||e.$("#world-select")?.value||"root"}function b(){let l=e.state.worlds||e.state._worldFull?.worlds||{},i=e.currentWorldId();return i==="root"?l.root?.name||"Main world":(l.children||[]).find(D=>D.id===i)?.name||i}function a(l){e.state.activeWorldId=l||"root",localStorage.setItem("fos_active_world",e.state.activeWorldId),e.populateWorldSelect(),e.updateWorldContextChrome()}function p(){let l=e.$("#world-select");if(!l)return;let i=e.state.activeWorldId||"root";[...l.options].some(g=>g.value===i)&&(l.value=i)}function u(){let l=e.activeWorldLabel();document.querySelectorAll("[data-active-world-label]").forEach(i=>{i.textContent=l}),e.syncWorldSelectValue(),e.currentView==="world"&&e.patchWorldTreeNav()}function m(){let l=e.$("#specialist-select-agents")?.value??e.state.selectedSpecialist??"";return l==="auto"?"":l||""}function n(){return e.$("#rag-mode-select")?.value||e.state.ragMode||"auto"}function t(){return!!e.currentSpecialistId()}function s(){let l=e.$("#world-select");if(!l)return;let i=e.state.worlds||e.state._worldFull?.worlds||{},g=i.root,D=i.children||[],A=D.map(y=>`<option value="${e.esc(y.id)}">${e.esc(y.name)} \xB7 ${e.esc(y.kind||"project")}</option>`).join("");l.innerHTML=`
      <optgroup label="Main">
        <option value="root">${e.esc(g?.name||"Main world")} \u2014 all context</option>
      </optgroup>
      ${D.length?`<optgroup label="Sub-worlds">${A}</optgroup>`:""}`;let v=e.state.activeWorldId||"root";[...l.options].some(y=>y.value===v)?l.value=v:(l.value="root",e.state.activeWorldId="root",localStorage.setItem("fos_active_world","root"))}e.ownerLabel=S,e.currentWorldId=k,e.activeWorldLabel=b,e.setActiveWorld=a,e.syncWorldSelectValue=p,e.updateWorldContextChrome=u,e.currentSpecialistId=m,e.currentRagMode=n,e.isDirectSpecialist=t,e.populateWorldSelect=s}function he(e){function S(t,s={}){e.state._viewLoading=!!t;let l=document.getElementById("global-progress"),i=l?.querySelector(".global-progress__bar");l&&(l.hidden=!t,l.setAttribute("aria-hidden",t?"false":"true"),t&&s.progress==null?(l.classList.add("is-indeterminate"),i&&(i.style.width="")):t&&s.progress!=null?(l.classList.remove("is-indeterminate"),i&&(i.style.width=`${Math.min(100,s.progress)}%`)):(l.classList.remove("is-indeterminate"),i&&(i.style.width="0")))}function k(t){e.actionBusyDepth++,e.actionBusyDepth===1&&(e.state._viewLoading||e.setViewLoading(!0),document.body.classList.add("is-action-busy"));let s=t?.closest?.("button, [role='button']")||t;s&&!e.actionBusyButton&&(e.actionBusyButton=s,s.classList.add("is-loading"),s.setAttribute("aria-busy","true"),"disabled"in s&&(s.disabled=!0))}function b(t){let s=t?.closest?.("button, [role='button']")||t;s&&e.actionBusyButton===s&&(s.classList.remove("is-loading"),s.removeAttribute("aria-busy"),"disabled"in s&&!s.dataset.keepDisabled&&(s.disabled=!1),e.actionBusyButton=null),e.actionBusyDepth=Math.max(0,e.actionBusyDepth-1),e.actionBusyDepth===0&&(e.state._viewLoading||e.setViewLoading(!1),document.body.classList.remove("is-action-busy"))}function a(t,s){e.beginActionBusy(s);try{let l=t();return l!=null&&typeof l.then=="function"?l.finally(()=>e.endActionBusy(s)):(e.endActionBusy(s),l)}catch(l){throw e.endActionBusy(s),l}}function p(t){return!t||t.id==="chat-send"||t.id==="chat-clear"||t.dataset.toggleUi!==void 0||t.dataset.goto!==void 0||t.dataset.toggleRun!==void 0||t.dataset.memoryTab!==void 0||t.dataset.vaultFacet!==void 0||t.dataset.vaultAddDoc!==void 0||t.dataset.vaultCancelDoc!==void 0||t.dataset.removeAttachment!==void 0||t.dataset.historyTab!==void 0||t.dataset.pickVaultDoc!==void 0||t.dataset.cancelEdit!==void 0||t.dataset.editWorld!==void 0||t.dataset.docsAction==="toggle"}function u(t="72%"){return`<span class="skeleton" style="display:block;height:12px;width:${t}"></span>`}function m(t=3){return`<div class="skeleton-card driver-card">${Array.from({length:t},(l,i)=>e.skeletonLine(i===0?"38%":"88%")).join("")}</div>`}function n(t){let s=`<div class="skeleton-grid">${e.skeletonCard(2)}${e.skeletonCard(2)}${e.skeletonCard(2)}</div>`;return t==="dashboard"?`<div class="view-skeleton dashboard-grid">${e.skeletonCard(2)}<div class="span-8">${e.skeletonCard(4)}</div><div class="span-4">${e.skeletonCard(2)}</div>${s}</div>`:t==="chat"?`<div class="view-skeleton"><div class="skeleton-card driver-card">${e.skeletonLine("30%")}${e.skeletonLine("60%")}</div><div class="skeleton-card driver-card" style="min-height:280px">${e.skeletonLine("100%")}${e.skeletonLine("92%")}${e.skeletonLine("78%")}</div></div>`:t==="world"?`<div class="view-skeleton dashboard-grid"><div class="span-4">${e.skeletonCard(3)}</div><div class="span-8">${e.skeletonCard(5)}</div>${s}</div>`:t==="documents"?`<div class="view-skeleton docs-workspace"><div class="skeleton-card driver-card">${e.skeletonCard(4)}</div><div class="skeleton-card driver-card">${e.skeletonCard(6)}</div></div>`:t==="outreach"?`<div class="view-skeleton">${e.skeletonCard(2)}${e.skeletonCard(4)}</div>`:`<div class="view-skeleton">${e.skeletonCard(3)}${s}</div>`}e.setViewLoading=S,e.beginActionBusy=k,e.endActionBusy=b,e.runWithActionBusy=a,e.shouldSkipActionBusy=p,e.skeletonLine=u,e.skeletonCard=m,e.renderViewSkeleton=n}function ge(e){function S(){e.state._worldVault=null,e.state._vaultGraph=null,e.state._vaultWorldId=null,e.state._vaultLoading=!1}function k(){return e.state._worldVault?.vault||e.state._worldVault||null}function b(s){return!!(s&&s!=="root"&&e.state._vaultWorldId===s&&e.vaultPayload())}function a(s,l=""){if(!s)return`${l}:empty`;let i=s.nodes||[],g=s.edges||[],D=s.meta||{},A=i.slice(0,12).map(v=>`${v.data?.id}:${v.data?.label}`).join("|");return`${l}:${i.length}:${g.length}:${D.updated||""}:${D.document_count||""}:${A}`}function p(...s){if(!s.length){Object.keys(e.graphDrawCache).forEach(l=>delete e.graphDrawCache[l]);return}s.forEach(l=>delete e.graphDrawCache[l])}function u(s,l,i={},g="Nothing to visualize yet."){if(!window.FOSGraph)return null;let D=document.getElementById(s);if(!D)return null;let A=D.parentElement?.querySelector(`[data-graph-placeholder-for="${s}"]`);A||(A=document.createElement("p"),A.className="graph-placeholder body-md muted",A.dataset.graphPlaceholderFor=s,D.insertAdjacentElement("afterend",A));let v=l?.nodes||[],y=l?.edges||[],L=v.length===1&&v[0]?.data?.type==="empty",W=v.length===1&&v[0]?.data?.type==="loading",N=v.length+y.length>0&&!L&&!W,q=e.graphDataSignature(l,`${s}:${i.layout?.name||"default"}:${i.onSelect?"interactive":"static"}`),z=null;return N?e.graphDrawCache[s]===q&&FOSGraph.getCy(s)&&!i.onSelect?z=FOSGraph.getCy(s):(z=FOSGraph.render(s,l,i),e.graphDrawCache[s]=q):(FOSGraph.destroy(s),delete e.graphDrawCache[s]),z?(D.classList.remove("is-empty"),A.hidden=!0):(D.classList.add("is-empty"),A.hidden=!1,A.textContent=W?v[0]?.data?.label||"Loading\u2026":g),z}function m(s){e.worldGraphTab=s,document.querySelectorAll("[data-world-graph-tab]").forEach(i=>{i.classList.toggle("is-active",i.dataset.worldGraphTab===s)});let l=document.getElementById("world-graph-legend");l&&(l.innerHTML=e.worldGraphLegendHtml(s)),e.drawGraphs()}async function n(){if(window.FOSGraph){try{window.FOSVendors&&await window.FOSVendors.ensure(["cytoscape"])}catch(s){console.warn("cytoscape load failed:",s);return}if(e.currentView==="dashboard"&&e.state._runtimeGraph&&e.renderGraphOrPlaceholder("graph-runtime-dash",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:20}},"Runtime graph appears when an agent is active."),e.currentView==="agents"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-agents")&&e.renderGraphOrPlaceholder("graph-runtime-agents",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="chat"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-chat")&&e.renderGraphOrPlaceholder("graph-runtime-chat",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="world"){let s=e.worldById(e.inspectorWorldId());if(e.worldGraphTab==="vault"&&!e.isRootWorld(s))e.renderGraphOrPlaceholder("graph-world",e.vaultGraphForWorld(s),{layout:FOSGraph.HIERARCHY_LAYOUT,onSelect:l=>{l.facet_id&&(e.state.ui={...e.state.ui||{},vaultFacet:l.facet_id},e.patchWorldPanels())}},"No files yet \u2014 add documents or link a GitHub repo in the knowledge panel below.");else{let l=e.worldGraphTab==="ecosystem"?e.state._worldGraph:e.state._worldHierarchyGraph||e.state._worldGraph;l?(e.renderGraphOrPlaceholder("graph-world",l,{layout:e.worldGraphTab==="hierarchy"?FOSGraph.HIERARCHY_LAYOUT:FOSGraph.LAYOUT,onSelect:i=>{i.world_id&&e.selectInspectorWorld(i.world_id)}},"World map will appear once your hierarchy is loaded."),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())):e.renderGraphOrPlaceholder("graph-world",null,{},"World map will appear once your hierarchy is loaded.")}}e.currentView==="memory"&&e.state._memoryGraph&&e.renderGraphOrPlaceholder("graph-memory",e.state._memoryGraph,{onSelect:s=>{let l=e.$("#graph-memory-detail");l&&(l.textContent=`${s.type}: ${s.label}`)}},"Memory graph fills in as you store knowledge and run agents.")}}async function t(){let s=e.currentView;if(["dashboard","agents","chat","world"].includes(s)&&!e.state._runtimeGraph)try{e.state._runtimeGraph=await e.api("/graph/runtime")}catch{e.state._runtimeGraph=null}if(s==="world"){if(!e.state._worldFull?.graph)try{let i=await e.api("/graph/world");e.state._worldGraph=i?.graph??null,e.state._worldHierarchyGraph=i?.hierarchy_graph??null,e.state._worldPreviews=i?.world_previews??{},e.state._worldFull=i,e.invalidateGraphCache("graph-world")}catch{}}else s==="dashboard"&&e.state._world&&(e.state._worldGraph=e.state._world.graph??e.state._worldGraph??null,e.state._world.worlds&&!e.state.worlds?.root&&(e.state.worlds=e.state._world.worlds));if(s==="memory"&&!e.state._memoryFull?.graph)try{let i=await e.api("/graph/memory");e.state._memoryGraph=i.graph??null,e.state._memoryFull=i,e.invalidateGraphCache("graph-memory")}catch{}}e.clearVaultScopedState=S,e.vaultPayload=k,e.vaultReadyFor=b,e.graphDataSignature=a,e.invalidateGraphCache=p,e.renderGraphOrPlaceholder=u,e.switchWorldGraphTab=m,e.drawGraphs=n,e.loadGraphData=t}function fe(e){function S(n,t="Waiting for activity\u2026"){return n?.length?`<div class="tool-flow">${n.map((s,l)=>{let i=l>0?'<span class="tool-flow-arrow" aria-hidden="true">\u2192</span>':"";if(s.type==="phase")return`${i}<span class="tool-flow-node">${e.esc(s.label)}</span>`;let g=s.decision==="approve"?" is-approve":s.decision==="deny"?" is-deny":"";return`${i}<span class="tool-flow-node${g}">${e.esc(s.name||s.label)}</span>`}).join("")}</div>`:`<p class="body-md muted">${e.esc(t)}</p>`}function k(n,t="live-panel"){let s=n?.jobs?.length?n.jobs:n?.active?[n]:[],l=s.some(v=>v.active||v.status==="running")||n?.active,i=s[0]||n||{},g=i.events||n?.events||[],D=g.map((v,y)=>`<option value="${y}"${y===g.length-1?" selected":""}>${e.esc(v.label||v.name||"Step")}</option>`).join(""),A=s.length?s.map(v=>`
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
        ${l&&i.id?`<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${e.esc(i.id)}">Stop</button>`:""}
      </div>
      <p class="live-phase" id="${t}-phase">${e.esc(i.phase||n?.phase||"Idle \u2014 send a message or delegate a task")}</p>
      ${g.length?`<label class="live-phase-select"><span class="caption-uppercase">Step</span>
        <select class="world-select" id="${t}-step" aria-label="Current step">${D}</select></label>`:""}
      <div id="${t}-flow">${e.renderLiveFlow(g)}</div>
      ${A?`<div class="live-jobs">${A}</div>`:""}
      ${l&&n?.elapsed_s?`<p class="world-meta">${n.elapsed_s}s elapsed \xB7 ${e.esc(n.actor||i.specialist||"")}</p>`:""}
    </section>`}function b(n){let t=e.$("#live-strip"),s=e.$("#live-strip-text");if(!t)return;let l=!!n?.active;l!==e.lastLiveActive&&(FOSMotion?.pulseLiveStrip?.(l),e.lastLiveActive=l),s&&l&&(s.textContent=n.phase||"Agent working\u2026")}function a(n){e.state.live=n||{},e.updateLiveStrip(n),e.$$("[id$='-phase']").forEach(t=>{t.textContent=n?.phase||"Idle"}),e.$$("[id$='-flow']").forEach(t=>{t.innerHTML=e.renderLiveFlow(n?.events||[])}),e.$$(".live-panel").forEach(t=>t.classList.toggle("is-active",!!n?.active))}async function p(){try{let n=await e.api("/live",{timeoutMs:15e3});if(e.state.live=n,e.patchLiveUI(n),["dashboard","agents","chat"].includes(e.currentView)&&(n?.active||e._runtimePollTick++%4===0)){let s=e.graphDataSignature(e.state._runtimeGraph,"runtime");e.state._runtimeGraph=await e.api("/graph/runtime").catch(()=>e.state._runtimeGraph);let l=e.graphDataSignature(e.state._runtimeGraph,"runtime");s!==l&&(e.invalidateGraphCache("graph-runtime-dash","graph-runtime-agents","graph-runtime-chat"),e.drawGraphs())}}catch{}}function u(){e.stopLivePoll(),e._runtimePollTick=0,e.pollLive(),e.scheduleLivePoll()}function m(){e.livePollTimer&&(clearTimeout(e.livePollTimer),e.livePollTimer=null)}e.renderLiveFlow=S,e.renderLivePanel=k,e.updateLiveStrip=b,e.patchLiveUI=a,e.pollLive=p,e.startLivePoll=u,e.stopLivePoll=m}function be(e){function S(p){return e.state._syncingLinkIds.has(String(p))}function k(){let p=document.getElementById("ops-stack");if(!p)return;let u=Date.now(),m=Object.values(e.state._operations||{}).filter(n=>n.status==="running"||n.finishedAt&&u-n.finishedAt<8e3).slice(0,5);if(!m.length){p.innerHTML="",p.hidden=!0;return}p.hidden=!1,p.innerHTML=m.map(n=>{let t=Math.round((n.progress||0)*100),s=n.status==="running"?"is-running":n.status==="error"?"is-error":"is-done",l=n.status==="running"?"Working":n.status==="error"?"Failed":"Done";return`<div class="ops-card ${s}" data-op-id="${e.esc(n.id)}">
        <div class="ops-card__head">
          <span class="ops-card__title">${e.esc(n.title)}</span>
          <span class="ops-card__status">${l}</span>
        </div>
        <p class="ops-card__detail">${e.esc(n.detail||"")}</p>
        ${n.status==="running"?`<div class="ops-card__bar" role="progressbar" aria-valuenow="${t}" aria-valuemin="0" aria-valuemax="100"><span style="width:${t}%"></span></div>`:""}
      </div>`}).join("")}async function b(p,u,m={}){let n=p;e.state._operations[n]={id:n,title:u,detail:"Scanning repository\u2026",progress:0,status:"running"},m.linkId!=null&&e.state._syncingLinkIds.add(String(m.linkId)),e.renderOpsStack(),m.worldId&&e.currentView==="world"&&e.render();try{for(;;){let t=await e.api(`/sync-jobs/${encodeURIComponent(p)}/batch`,{method:"POST",body:JSON.stringify({batch_size:8}),timeoutMs:18e4}),s=e.state._operations[n];if(s&&(s.progress=t.progress||0,s.detail=t.message||`${t.imported||0} files imported`,s.status=t.status==="failed"?"error":t.done?"done":"running"),e.renderOpsStack(),t.done)break}}catch(t){let s=e.state._operations[n];throw s&&(s.status="error",s.detail=t.message||"Sync failed",s.finishedAt=Date.now()),e.renderOpsStack(),t}finally{let t=e.state._operations[n];t&&!t.finishedAt&&(t.finishedAt=Date.now()),m.linkId!=null&&e.state._syncingLinkIds.delete(String(m.linkId)),e.renderOpsStack();try{await e.refresh(),m.worldId&&await e.reloadVault(m.worldId,{force:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.patchAgentsVaultPanel(),e.updateBadges()}catch{}setTimeout(()=>{delete e.state._operations[n],e.renderOpsStack()},8e3)}}async function a(p){let u=await e.api(`/worlds/${encodeURIComponent(p)}/sync-jobs`).catch(()=>({jobs:[]}));for(let m of u.jobs||[])!m?.id||e.state._operations[m.id]||e.runGithubSyncJob(m.id,`Syncing ${m.full_name}`,{worldId:p,linkId:m.link_id}).catch(console.error)}e.isLinkSyncing=S,e.renderOpsStack=k,e.runGithubSyncJob=b,e.resumeActiveSyncJobs=a}function ve(e){function S(){e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit"}async function k(p,u,m){let n=e.$("#md-editor-dialog");if(!(!n||!p||!u)){e.mdEditorState={mode:"vault",artifactId:null,worldId:p,docId:u,editMode:!1},e.$("#md-dialog-title").textContent=m||"Document",e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit",e.$("#md-dialog-preview").innerHTML="<p class='body-md muted'>Loading\u2026</p>",n.showModal();try{let s=(await e.api(`/worlds/${encodeURIComponent(p)}/vault/documents/${encodeURIComponent(u)}/content`,{timeoutMs:2e4})).content||"";e.$("#md-dialog-source").value=s;let l=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(l,s)}catch(t){e.$("#md-dialog-preview").innerHTML=`<p class="body-md" style="color:var(--color-warn)">${e.esc(t.message||"Could not load document")}</p>`}}}async function b(){let p=e.$("#md-dialog-source")?.value??"";if(e.mdEditorState.mode==="vault"&&e.mdEditorState.worldId&&e.mdEditorState.docId){await e.api(`/worlds/${encodeURIComponent(e.mdEditorState.worldId)}/vault/documents/${encodeURIComponent(e.mdEditorState.docId)}`,{method:"PATCH",body:JSON.stringify({content:p}),timeoutMs:15e3});let m=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(m,p),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit";return}if(!e.mdEditorState.artifactId)return;await e.api(`/artifacts/${e.mdEditorState.artifactId}/content`,{method:"PUT",body:JSON.stringify({content:p}),timeoutMs:15e3});let u=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(u,p),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}function a(){e.$("#md-dialog-close")?.addEventListener("click",()=>{e.$("#md-editor-dialog")?.close(),e.resetMdEditorDialog()}),e.$("#md-dialog-mode")?.addEventListener("click",async()=>{if(e.mdEditorState.mode!=="vault"&&!e.mdEditorState.artifactId)return;e.mdEditorState.editMode=!e.mdEditorState.editMode;let p=e.$("#md-dialog-source"),u=e.$("#md-dialog-preview");if(e.mdEditorState.editMode)p.hidden=!1,u.hidden=!0,e.$("#md-dialog-save").hidden=!1,e.$("#md-dialog-mode").textContent="Preview";else{let m=p?.value??"";await window.FOSMarkdown?.renderInto?.(u,m),p.hidden=!0,u.hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}}),e.$("#md-dialog-save")?.addEventListener("click",()=>e.saveMdEditor().catch(p=>alert(p.message)))}e.resetMdEditorDialog=S,e.openVaultDocViewer=k,e.saveMdEditor=b,e.initMdEditorDialog=a}function ye(e){function S(){let n=e.state._nudges||[];return n.length?`<section class="driver-card span-12 up-next-panel">
      <p class="caption-uppercase">Up next</p>
      <p class="body-md muted">Reminders, follow-ups, approvals, and vault prompts for your active world.</p>
      <ul class="up-next-list">${n.slice(0,8).map((s,l)=>`
      <li class="up-next-item${(s.priority||9)<=2?" is-urgent":""}">
        <div class="up-next-item__body">
          <p class="up-next-item__title">${e.esc(s.title)}</p>
          <p class="up-next-item__meta muted">${e.esc(s.body||"")}</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-nudge-index="${l}">Open</button>
      </li>`).join("")}</ul>
    </section>`:""}function k(n){let t=e.state._nudges?.[Number(n)];if(!t)return;if(t.kind==="vault_leads"&&t.meta?.doc_id){e.tagVaultDocInChat(t.meta.doc_id,t.meta.world_id,t.title,"");return}let s=t.action||"chat";if(s==="crm")return e.goView("crm");if(s==="goals")return e.goView("goals");if(s==="approvals")return e.goView("approvals");if(s==="documents")return e.goView("documents");if(s==="world")return e.goView("world");e.goView(s)}function b(n,t,s){let l=document.getElementById(n);if(!l)return;let i=l.closest(".chart-panel");if(!i)return;let g=i.querySelector(".chart-empty");g||(g=document.createElement("p"),g.className="chart-empty muted body-md",i.appendChild(g)),g.textContent=t,g.hidden=!s,l.hidden=s}function a(){let n=window.innerWidth<640,t=e.state._world?.tools_by_category||e.state.about?.tools_by_category||{},s=Object.entries(t).slice(0,n?5:8);s.length&&e.$("#chart-tools")?(e.chartPanelNote("chart-tools","",!1),FOSCharts.bar("chart-tools",s.map(([A])=>A),s.map(([,A])=>A),{colors:e.CHART_COLORS})):e.chartPanelNote("chart-tools","No tool data yet.",!0);let l=e.state.snapshot?.crm?.by_status||{},i=Object.entries(l).filter(([,A])=>A>0).map(([A,v])=>({label:A,value:v}));i.length&&e.$("#chart-crm")?(e.chartPanelNote("chart-crm","",!1),FOSCharts.donut("chart-crm",i,{centerLabel:"contacts",colors:e.CHART_COLORS})):e.chartPanelNote("chart-crm","No CRM contacts yet \u2014 add leads in Chat or CRM.",!0);let D=[...e.state.usage_history||[]].reverse().map(A=>A.llm_calls||A.calls||0);D.length&&e.$("#chart-usage")?(e.chartPanelNote("chart-usage","",!1),FOSCharts.spark("chart-usage",D)):e.chartPanelNote("chart-usage","No LLM usage in the last 7 days.",!0)}function p(){let n=e.state.config||{},t=e.state.snapshot?.approvals_pending||0,s=n.agent_paused;return`
      <section class="driver-card span-12 operator-panel" aria-label="Direct actions">
        <div class="operator-panel__head">
          <div>
            <p class="section-eyebrow">You drive</p>
            <h3 class="title-sm">Direct controls</h3>
            <p class="body-md muted">Manage worlds, CRM, goals, and agent policy yourself. Chat is optional \u2014 use it when you want help.</p>
          </div>
          <div class="operator-panel__status">
            <span class="pill ${s?"warn":"ok"}">${s?"Agent paused":"Agent on standby"}</span>
            <span class="pill info">${e.esc(n.autonomy_level||"balanced")} autonomy</span>
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
      </section>`}function u(n){if(e.state.ui||(e.state.ui={}),n==="create-world"){e.state.ui.worldCreateOpen=!0,e.currentView==="world"?(e.render(),requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"}))):(e.goView("world"),e.state._scrollWorldCreate=!0);return}if(n==="add-contact"){e.state.ui.crmFormOpen=!0,e.currentView==="crm"?e.render():e.goView("crm");return}if(n==="add-goal"){e.state.ui.goalsFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}if(n==="add-reminder"){e.state.ui.reminderFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}n==="settings"&&e.goView("settings"),n==="approvals"&&e.goView("approvals")}function m(){let n=e.state.snapshot||{},t=n.crm||{},s=e.state.finance||{},l=e.state.usage||{},i=e.state.about||{},g=e.state.config||{},D=n.approvals_pending||0,A=s.set?`<span class="pill ${s.status==="healthy"?"ok":s.status==="warning"?"warn":"info"}">${e.esc(s.status)}</span>`:"",v=s.set?s.runway||(s.runway_months!=null?s.runway_months+" mo":"\u2014"):null,y=(e.state.goals||[]).slice(0,5).map(q=>`<li>${e.esc(q.title)}</li>`).join("")||"<li class='muted'>No active goals \u2014 add one in Goals or use Direct controls.</li>",L=D>0?`<div class="spec-cell race-position-cell"><dt>Approvals</dt><dd>${D}</dd></div>`:'<div class="spec-cell"><dt>Approvals</dt><dd>0</dd></div>',W=e.state.live||{},N=e.state._agents||{};return`<div class="dashboard-grid">
        ${e.renderUpNext()}
        ${e.renderOperatorPanel()}
        <section class="driver-card span-8">
          ${e.renderLivePanel(W)}
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">World state</p>
          <p class="world-meta" style="margin-top:var(--space-xxs)">Updated ${e.esc(n.ts||"now")}</p>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tools</dt><dd>${i.total_tools||0}</dd></div>
            <div class="spec-cell"><dt>Agents</dt><dd>${(N.specialists?.length||4)+1}</dd></div>
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
          <div class="activity-timeline">${(e.state.actions||[]).slice(0,8).map(q=>`<div class="activity-timeline__row"><span class="mono">${e.esc(q.tool_name)}</span><span class="muted">${e.esc((q.created_at||"").slice(11,19))}</span></div>`).join("")||"<p class='muted'>No tool actions yet</p>"}</div>
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">Specialist status</p>
          <div class="specialist-chips">${e.listSpecialists(N).map(q=>`<span class="specialist-chip${e.agentBusy(W,q.id)?" is-busy":""}">${e.esc(q.label)}</span>`).join("")}</div>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents" style="margin-top:var(--space-sm)">Open agents</button>
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Runway ${A}</p>
          ${v?`<dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Cash</dt><dd class="small">${e.fmtMoney(s.cash)}</dd></div>
            <div class="spec-cell"><dt>Burn</dt><dd class="small">${e.fmtMoney(s.monthly_burn)}</dd></div>
            <div class="spec-cell"><dt>MRR</dt><dd class="small">${e.fmtMoney(s.mrr)}</dd></div>
            <div class="spec-cell"><dt>Runway</dt><dd class="small">${e.esc(v)}</dd></div>
          </dl>`:'<p class="body-md" style="margin-top:var(--space-sm)">Set cash, burn, and MRR in Settings or ask the agent to track runway.</p>'}
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Active goals</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${y}</ul>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tasks open</dt><dd>${n.tasks_open||0}</dd></div>
            <div class="spec-cell"><dt>LLM today</dt><dd class="small">${l.llm_calls||0}</dd></div>
          </dl>
        </section>
      </div>`}e.renderUpNext=S,e.handleNudgeAction=k,e.chartPanelNote=b,e.drawDashboardCharts=a,e.renderOperatorPanel=p,e.openOperatorAction=u,e.renderDashboard=m}function we(e){function S(){return localStorage.getItem("fos_chat_session")||""}function k(C){C?localStorage.setItem("fos_chat_session",C):localStorage.removeItem("fos_chat_session")}function b(C){C?.session_id&&e.setChatSessionId(C.session_id)}async function a(){let C=e.chatSessionId();if(C)try{let r=await e.api(`/history/sessions/${C}`);r?.messages?.length&&(e.chatHistory=r.messages.map(d=>({role:d.role==="assistant"?"agent":d.role,text:d.content})),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)))}catch{}}function p(C={}){let r={world_id:e.currentWorldId(),rag_mode:e.currentRagMode(),session_id:e.chatSessionId()||void 0,specialist:e.currentSpecialistId()||void 0,...C},d=(e.state._chatAttachments||[]).filter(w=>w?.doc_id);return d.length&&(r.attachments=d.map(w=>({type:"vault",doc_id:w.doc_id,title:w.title,path:w.path}))),r}function u(C){if(C.pending)return`<div class="msg-pending"><span class="live-pulse" aria-hidden="true"></span> ${e.esc(C.pendingLabel||"Agent working\u2026")}</div>`;let r=C.text||"";if(C.role==="agent"||C.role==="assistant"){let d=window.FOSMarkdown?.render?.(r)||e.esc(r),w=(C.artifacts||[]).map(I=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${I.id}">${e.esc(I.title||I.kind||"Document")}</button>`).join("");return`<div class="msg-md">${d}</div>${w?`<div class="msg-artifacts">${w}</div>`:""}`}return`<div class="msg-plain">${e.esc(r)}</div>`}function m(C,r){return`msg:${C}:${e.chatSessionId()||"default"}:${r}`}function n(C){return C<=0?e.MSG_READ_INITIAL_LINES:C===1?e.MSG_READ_INITIAL_LINES+e.MSG_READ_EXPAND_LINES:1/0}function t(C){let r=C||document.getElementById("content");r&&(e.state._msgExpand||(e.state._msgExpand={}),r.querySelectorAll(".msg-read-more-host").forEach(d=>{let w=d.querySelector(":scope > .msg-md, :scope > .msg-plain"),I=d.querySelector(".msg-read-more");if(!w||!I)return;let V=d.dataset.msgScope||"chat",F=d.dataset.msgIndex??"0",U=e.msgExpandKey(V,F),h=e.state._msgExpand[U]||0,$=parseFloat(getComputedStyle(w).lineHeight)||21,T=Math.max(1,Math.round(w.scrollHeight/$)),P=e.msgReadLineLimit(h);if(I.dataset.msgReadMore=U,P>=T||h>=2){w.classList.remove("msg-body--clamped"),w.style.maxHeight="",I.hidden=!0;return}w.classList.add("msg-body--clamped"),w.style.maxHeight=`${P*$}px`,I.hidden=!1,I.textContent="Read more"}))}function s(C){return C?.length?`<div class="msg-artifacts">${C.map(r=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${r.id}">${e.esc(r.title||r.kind||"File")}</button>`).join("")}</div>`:""}async function l(){let C=e.currentWorldId(),r=C&&C!=="root"?`?world_id=${encodeURIComponent(C)}`:"";try{let d=await e.api(`/history${r}`,{timeoutMs:15e3});e.state._chatSessions=d.sessions||[]}catch{e.state._chatSessions=e.state._chatSessions||[]}}function i(){let C=e.state._chatSessions||[],r=e.chatSessionId();return`<section class="chat-sessions-strip driver-card">
      <div class="chat-sessions-strip__head">
        <p class="caption-uppercase">Chats</p>
        <button type="button" class="button-primary button-sm" data-new-chat-session>+ New</button>
      </div>
      <div class="chat-sessions-strip__list">${C.map(w=>`
      <button type="button" class="chat-session-chip${w.id===r?" is-active":""}" data-chat-session="${e.esc(w.id)}">
        <span class="chat-session-chip__title">${e.esc(w.title||"Conversation")}</span>
        <span class="chat-session-chip__meta">${e.fmtHistoryTime(w.updated_at)}</span>
      </button>`).join("")||"<span class='muted body-md'>No previous chats</span>"}</div>
    </section>`}async function g(C){e.openDocumentsWorkspace(C)}function D(){let C=e.state._chatAttachments||[];return C.length?`<div class="chat-attachments">${C.map((r,d)=>`<span class="chat-attachment-chip">
        <span>\u{1F4CE} ${e.esc(r.title||"File")}</span>
        <button type="button" class="chat-attachment-chip__remove" data-remove-attachment="${d}" aria-label="Remove attachment">\xD7</button>
      </span>`).join("")}</div>`:""}async function A(){let C=e.currentWorldId();if(!C||C==="root"){alert("Select a project world (not Main) to attach vault documents.");return}await e.ensureVaultForWorld(C);let r=e.vaultPayload()||{},d=r.facets||r.folders||[],w=[];for(let F of d)for(let U of F.documents||[])e.isMarkdownFilename(U.filename||U.github_path)&&w.push(U);let I=e.$("#vault-picker-list"),V=e.$("#vault-picker-dialog");!I||!V||(I.innerHTML=w.length?w.map(F=>`
      <button type="button" class="vault-picker-item" data-pick-vault-doc="${F.id}" data-world-id="${e.esc(C)}" data-doc-title="${e.esc(F.title)}" data-doc-path="${e.esc(F.github_path||F.filename||"")}">
        <strong>${e.esc(F.title)}</strong>
        <span class="muted">${e.esc(F.github_path||F.filename||"")}</span>
      </button>`).join(""):"<p class='body-md muted'>No markdown docs in vault \u2014 link and sync a GitHub repo in Worlds.</p>",V.showModal())}async function v(C){for(;;){let r=await e.api(`/chat/jobs/${encodeURIComponent(C)}`,{timeoutMs:2e4}),d=r.job;if(!d)break;if(e.state._activeJob=d,e.patchLiveUI(e.state.live),e.patchChatJobBubble(d),["completed","failed","cancelled"].includes(d.status))return{job:d,pending_approvals:r.pending_approvals};await e.sleep(1200)}return null}function y(C){let r=e.chatHistory.findIndex(w=>w.jobId===C.id);if(r<0)return;C.status==="running"?(e.chatHistory[r].pending=!0,e.chatHistory[r].pendingLabel=C.phase||"Agent working\u2026"):(e.chatHistory[r].pending=!1,e.chatHistory[r].text=C.result||C.error||"(no response)",e.chatHistory[r].artifacts=C.artifacts||[],C.session_id&&e.setChatSessionId(C.session_id));let d=e.$("#chat-messages");d&&e.currentView==="chat"&&(d.innerHTML=e.renderChatMessagesInner(),window.FOSMarkdown?.enhance?.(d),e.initMsgReadMore(d),d.scrollTop=d.scrollHeight),e.updateLiveStrip({active:C.status==="running",phase:C.phase}),e.$$("#chat-live-panel-phase, [id$='-phase']").forEach(w=>{w&&(w.textContent=C.phase||"Idle")})}function L(){return e.chatHistory.length?e.chatHistory.map((r,d)=>r.pending?`<div class="msg ${r.role} is-pending"><div class="msg-bubble">${e.renderMessageHtml(r)}</div></div>`:`<div class="msg ${r.role}">
        <div class="msg-bubble msg-read-more-host" data-msg-scope="chat" data-msg-index="${d}">
          ${e.renderMessageHtml(r)}
          <button type="button" class="msg-read-more" hidden>Read more</button>
        </div>
      </div>`).join(""):""}async function W(C,{direct:r=!1,specId:d=""}={}){let w=e.chatPayload({message:C});r&&d&&(w.specialist=d);let I=await e.api("/chat/async",{method:"POST",body:JSON.stringify(w),timeoutMs:2e4});e.state._chatAttachments=[];let V=I.job;e.chatHistory.push({role:"agent",text:"",pending:!0,jobId:V.id,pendingLabel:V.phase||"Starting\u2026"}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.state._activeJob=V,e.render(),e.startLivePoll();try{let F=await e.pollAgentJob(V.id);F?.job?.session_id&&e.setChatSessionId(F.job.session_id),F?.pending_approvals&&(e.state.approvals=F.pending_approvals,e.updateBadges()),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.loadChatSessionsList()}finally{e.state._activeJob=null,e.pollLive(),e.currentView==="chat"&&e.render()}}async function N(C){let r=C||e.state._activeJob?.id;if(r)try{await e.api(`/chat/jobs/${encodeURIComponent(r)}/cancel`,{method:"POST",timeoutMs:1e4}),e.state._activeJob?.id===r?await e.pollAgentJob(r):e.pollLive()}catch(d){alert(d.message)}}function q(){let C=e.state._agents||{},r=e.routingMeta(C),d=e.routingLabel(C),w=e.isDirectSpecialist(),I=e.listSpecialists(C),V=e.state.ragMode||"auto",F=e.RAG_MODES.find(M=>M.id===V)||e.RAG_MODES[0],U=e.renderChatMessagesInner(),h=e.state.live||{},$=!e.chatHistory.length,T=!!e.state._activeJob?.active||e.chatHistory.some(M=>M.pending),P=e.collectAgentRuns().slice(0,4);return`<div class="chat-shell">
      <header class="chat-header driver-card">
        <div>
          <p class="section-eyebrow">Optional \xB7 agent assist</p>
          <h2 class="title-md">Ask agent</h2>
        </div>
        <div class="chat-header__meta">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          <span class="badge-pill agent-routing-badge">${e.esc(d)}</span>
          ${T?'<span class="badge-pill badge-pill--alert">Working</span>':""}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents">Change specialist</button>
        </div>
      </header>
      ${e.renderChatSessionsList()}
      <div class="chat-layout chat-layout--rich">
        <div class="chat-wrap">
          <div class="chat-messages${$?" is-empty":""}" id="chat-messages">
            ${$?`<div class="chat-empty">
              <p class="title-md">Supervisor ready</p>
              <p class="body-md">Routing: <strong>${e.esc(d)}</strong> \xB7 Retrieval: <strong>${e.esc(F.label)}</strong></p>
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
              <textarea class="text-input-on-dark chat-input" id="chat-input" placeholder="${w?`Task for ${e.esc(r.label)}\u2026`:"Message supervisor\u2026"}" rows="3"${T?" disabled":""}></textarea>
              <button class="button-primary" id="chat-send"${T?" disabled":""}>${w?`Run ${e.esc(r.label)}`:"Send"}</button>
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
          ${e.renderLivePanel(h,"chat-live-panel")}
          <section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Specialists</p>
            <div class="specialist-chips" style="margin-top:var(--space-xxs)">${I.map(M=>`<span class="specialist-chip${e.currentSpecialistId()===M.id?" is-selected":""}${e.agentBusy(h,M.id)?" is-busy":""}">${e.esc(M.label)}</span>`).join("")}</div>
          </section>
          ${P.length?`<section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Recent runs</p>
            <div class="activity-timeline">${P.map(M=>`<div class="activity-timeline__row"><span>${e.esc((M.agent||"").toUpperCase())}</span><span class="muted">${e.esc((M.task||"").slice(0,40))}</span></div>`).join("")}</div>
          </section>`:""}
        </aside>
      </div>
    </div>`}function z(){requestAnimationFrame(()=>{let C=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),r=C?.[C.length-1];FOSMotion?.animateNewMessage?.(r)})}async function Z(){try{await e.api("/auth/logout",{method:"POST",body:"{}"})}catch{}e.showPinGate()}async function ae(){let C=e.$("#chat-input"),r=(C?.value||"").trim();if(!r||e.chatHistory.some(U=>U.pending))return;let d=e.currentSpecialistId(),w=e.routingMeta(e.state._agents||{}),I=!!d;C.value="",e.chatHistory.push({role:"user",text:r}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render(),e.animateLatestChatMessage();let V=e.$("#chat-send"),F=I?`Run ${w.label}`:"Send";V&&(V.disabled=!0,V.textContent="\u2026");try{await e.startAgentJob(r,{direct:I,specId:d})}catch(U){e.chatHistory.push({role:"system",text:"Error: "+U.message}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render()}V&&(V.disabled=!1,V.textContent=F),e.animateLatestChatMessage()}async function J(){let C=!e.state.config?.agent_paused;await e.api("/agent/pause",{method:"POST",body:JSON.stringify({paused:C})}),await e.refresh(),e.render()}e.chatSessionId=S,e.setChatSessionId=k,e.applyChatSessionResponse=b,e.loadChatFromServer=a,e.chatPayload=p,e.renderMessageHtml=u,e.msgExpandKey=m,e.msgReadLineLimit=n,e.initMsgReadMore=t,e.renderArtifactLinks=s,e.loadChatSessionsList=l,e.renderChatSessionsList=i,e.openMdEditor=g,e.renderChatAttachmentChips=D,e.openVaultAttachPicker=A,e.pollAgentJob=v,e.patchChatJobBubble=y,e.renderChatMessagesInner=L,e.startAgentJob=W,e.cancelActiveJob=N,e.renderChat=q,e.animateLatestChatMessage=z,e.logoutPin=Z,e.sendChat=ae,e.togglePause=J}function _e(e){function S(t){t!=null&&(e.state._documentsSelectedId=Number(t)),e.goView("documents")}function k(){let t=e.state._artifacts||[],s=e.state._documentsSelectedId,l=t.find(v=>v.id===s),i=e.state._documentDraft??"",g=e.documentsEditMode,D=t.length?t.map(v=>`
      <button type="button" class="docs-list-item${v.id===s?" is-active":""}" data-select-document="${v.id}">
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
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="toggle">${g?"Preview":"Edit"}</button>
          <button type="button" class="button-primary button-sm" data-docs-action="save">Save</button>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="memory">Save to memory</button>
        </div>
        <div class="docs-editor__body">
          ${g?`<textarea id="docs-source" class="docs-source text-input-on-dark" aria-label="Document source">${e.esc(i)}</textarea>`:'<div id="docs-preview" class="md-content msg-md docs-preview"></div>'}
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
          <div class="docs-list">${D}</div>
        </aside>
        <section class="driver-card docs-editor-panel">${A}</section>
      </div>`}async function b(){let t=prompt("Document title","Untitled");if(!t)return;let s=e.currentWorldId(),l=await e.api("/artifacts",{method:"POST",body:JSON.stringify({title:t,content:`# ${t}

`,world_id:s&&s!=="root"?s:null}),timeoutMs:15e3});e.state._documentsSelectedId=l.artifact?.id,e.documentsEditMode=!0,await e.loadViewData("documents"),e.render()}async function a(t){if(!t)return;let s=new FormData;s.append("file",t);let l=e.currentWorldId();l&&l!=="root"&&s.append("world_id",l);let i=await e.apiUpload("/artifacts",s);e.state._documentsSelectedId=i.artifact?.id,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function p(){let t=e.state._documentsSelectedId;if(!t)return;let s=document.getElementById("docs-source")?.value??e.state._documentDraft??"",l=document.getElementById("docs-title-input")?.value??"Untitled",i=document.getElementById("docs-world-select")?.value??"root";await e.api(`/artifacts/${t}/content`,{method:"PUT",body:JSON.stringify({content:s}),timeoutMs:15e3}),await e.api(`/artifacts/${t}`,{method:"PATCH",body:JSON.stringify({title:l,world_id:i==="root"?null:i}),timeoutMs:15e3}),e.state._documentDraft=s,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function u(){let t=e.state._documentsSelectedId;if(!t)return;e.documentsEditMode&&await e.saveCurrentDocument();let s=await e.api(`/artifacts/${t}/memory`,{method:"POST",body:"{}",timeoutMs:2e4});alert(`Saved to memory (${s.collection||"documents"}).`)}async function m(t){e.state._documentsSelectedId=Number(t),e.documentsEditMode=!1;try{let s=await e.api(`/artifacts/${t}/content`,{timeoutMs:15e3});e.state._documentDraft=s.content||""}catch(s){e.state._documentDraft="",alert(s.message||"Could not load document")}e.render()}function n(t){let s=(t||"").toLowerCase();return s.endsWith(".md")||s.endsWith(".markdown")||s.endsWith(".rst")}e.openDocumentsWorkspace=S,e.renderDocuments=k,e.createNewDocument=b,e.uploadDocumentFile=a,e.saveCurrentDocument=p,e.saveDocumentToMemory=u,e.selectDocument=m,e.isMarkdownFilename=n}function $e(e){function S(r){let d=r?.supervisor||{};return{id:"supervisor",label:"Supervisor",role:"aggregator",tool_count:r?.total_tools,brief:d.role||"Orchestrates specialists \u2014 picks who to run when routing is Auto"}}function k(r){let d=r?.specialists||[];return(d.length?d:e.DEFAULT_SPECIALISTS).map(I=>({...I,label:I.label||I.id}))}function b(){let r=e.listSpecialists(e.state._agents||{}),d=e.state.selectedSpecialist??"";d&&!r.some(U=>U.id===d)&&(d=""),e.state.selectedSpecialist=d;let I=`<option value="">Auto \u2014 supervisor decides</option>${r.map(U=>`<option value="${e.esc(U.id)}">${e.esc(U.label)}</option>`).join("")}`,V=e.$("#specialist-select-agents");V&&(V.innerHTML=I,V.value=d);let F=e.$("#chat-specialist-select");F&&(F.innerHTML=I,F.value=d)}function a(r){let d=e.currentSpecialistId();return d?`Supervisor \u2192 ${e.listSpecialists(r||e.state._agents||{}).find(I=>I.id===d)?.label||d}`:"Supervisor \xB7 auto-route"}function p(r){let d=e.state._agents||r||{},w=e.currentSpecialistId();return w?e.listSpecialists(d).find(I=>I.id===w)||{id:w,label:w,role:"specialist"}:e.supervisorMeta(d)}function u(r,d){let w=r?.jobs||[],I=String(d||"");if(w.some(F=>F.status==="running"&&(F.specialist===I||I==="supervisor"&&F.mode==="chat")))return!0;let V=r?.active?String(r.actor||""):"";return I==="supervisor"?V==="user":V===`subagent:${I}`||I&&V.includes(I)}function m(r){let d=e.AGENT_ROLES[r]||{label:r||"Specialist",cls:""};return`<span class="agent-role-badge ${d.cls}">${e.esc(d.label)}</span>`}function n(r,d){let w=e.AGENT_ROLES[d]||e.AGENT_ROLES.aggregator,I=e.AGENT_INITIALS[r]||(r||"??").slice(0,2).toUpperCase();return`<span class="agent-avatar ${w.avatar||"agent-avatar--aggregator"}" aria-hidden="true">${e.esc(I)}</span>`}function t(r,d){let w=(d||[]).find(V=>V.agent===r);return w?.ts?new Date(typeof w.ts=="number"&&w.ts<1e12?w.ts*1e3:w.ts).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function s(){let r=e.state._agentRunsApi||[],w=[...e.readJsonStorage("fos_agent_runs",[])];for(let I of r)w.some(V=>V.id===I.id)||w.push({...I,source:"trace"});return w.sort((I,V)=>(V.ts||0)-(I.ts||0)),w.slice(0,50)}function l(r){let d=e.readJsonStorage("fos_agent_runs",[]);d.unshift(r),localStorage.setItem("fos_agent_runs",JSON.stringify(d.slice(0,50)))}function i(r){let d=!e.currentSpecialistId();return`<button type="button" class="fleet-card fleet-card--auto${d?" is-selected":""}" data-select-specialist="" aria-pressed="${d}">
      ${d?'<span class="fleet-card__active-label">Routing</span>':""}
      <div class="fleet-card__top">
        <span class="agent-avatar agent-avatar--aggregator" aria-hidden="true">AU</span>
        <span class="fleet-card__status" title="Supervisor routes"></span>
      </div>
      <div class="fleet-card__name">Auto</div>
      <span class="agent-role-badge agent-role--aggregator">Supervisor picks</span>
      <div class="fleet-card__meta"><span>Default routing</span></div>
    </button>`}function g(r,d){let w=e.supervisorMeta(r),I=e.agentBusy(d,"supervisor");return`<div class="supervisor-banner driver-card">
      <div class="agent-card-title-row">
        ${e.agentAvatar("supervisor",w.role)}
        <div>
          <h2 class="title-md">${e.esc(w.label)} <span class="supervisor-main-tag">Main agent</span></h2>
          <p class="world-meta">${e.esc((w.brief||"").slice(0,140))}</p>
        </div>
      </div>
      <span class="agent-status ${I?"busy":"ready"}">${I?"Working":"Always on"}</span>
    </div>`}function D(r,d,w,I){let V=e.agentBusy(d,r.id),F=w===r.id,U=e.lastRunForAgent(r.id,I);return`<button type="button" class="fleet-card${V?" is-busy":""}${F?" is-selected":""}" data-select-specialist="${e.esc(r.id)}" aria-pressed="${F}">
      ${F?'<span class="fleet-card__active-label">Direct</span>':""}
      <div class="fleet-card__top">
        ${e.agentAvatar(r.id,r.role)}
        <span class="fleet-card__status ${V?"is-busy":""}" title="${V?"Working":"Idle"}"></span>
      </div>
      <div class="fleet-card__name">${e.esc(r.label)}</div>
      ${r.role?e.agentRoleBadge(r.role):""}
      <p class="fleet-card__brief">${e.esc((r.brief||"").slice(0,72))}</p>
      <div class="fleet-card__meta">
        <span>${r.tool_count??"\u2014"} tools</span>
        ${U?`<span>${e.esc(U)}</span>`:""}
      </div>
    </button>`}function A(r,d,w=!1){let I=e.listSpecialists(r),V=e.currentSpecialistId(),F=e.collectAgentRuns();return w?`<div class="fleet-rail">${e.renderFleetAutoCard(d)}${I.map(U=>e.renderFleetCard(U,d,V,F)).join("")}</div>`:`<div class="agent-grid">${I.map(U=>{let h={...U,label:U.label||U.id};return`<article class="agent-card${e.agentBusy(d,U.id)?" is-busy":""}">
          <div class="agent-card-head">${e.renderFleetCardInner(h,d,F)}</div>
        </article>`}).join("")}</div>`}function v(r,d,w){let I=e.agentBusy(d,r.id),V=e.lastRunForAgent(r.id,w);return`
      <div class="agent-card-title-row">
        ${e.agentAvatar(r.id,r.role)}
        <div><h3>${e.esc(r.label)}</h3>${r.role?e.agentRoleBadge(r.role):""}</div>
      </div>
      <span class="agent-status ${I?"busy":"ready"}">${I?"Working":"Ready"}</span>
      <p class="agent-meta">${r.tool_count??0} tools${V?` \xB7 ${e.esc(V)}`:""}</p>`}function y(r){return r.length?`<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Time</th><th>Agent</th><th>Task</th><th>Duration</th><th>Tools</th><th></th></tr></thead>
      <tbody>${r.map(d=>{let w=d.ts?e.fmtTime(d.ts):"\u2014",I=(d.tools||[]).slice(0,4).join(", "),V=e.state.expandedRunId===d.id;return`<tr class="data-row${V?" is-expanded":""}" data-run-id="${e.esc(d.id)}">
          <td class="mono muted">${e.esc(w)}</td>
          <td><span class="fleet-inline-badge">${e.esc((d.agent||"").toUpperCase())}</span></td>
          <td class="task-cell">${e.esc((d.task||"").slice(0,120))}</td>
          <td class="mono">${d.duration_s?`${d.duration_s}s`:"\u2014"}</td>
          <td class="muted">${e.esc(I||"\u2014")}</td>
          <td><button type="button" class="button-tertiary-text button-sm" data-toggle-run="${e.esc(d.id)}">${V?"Hide":"View"}</button></td>
        </tr>
        ${V?`<tr class="data-row-detail"><td colspan="6"><pre class="run-result mono">${e.esc(d.result||"No output recorded")}</pre></td></tr>`:""}`}).join("")}</tbody>
    </table></div>`:'<div class="empty-state"><p class="title-sm">No specialist runs yet</p></div>'}function L(){let r=e.state._tools||{},d=r.by_category||{};return`<div class="console-split">
      <div class="driver-card">${Object.entries(d).sort((I,V)=>V[1]-I[1]).map(([I,V])=>`<div class="kv-row"><span class="k">${e.esc(I)}</span><span class="v">${V}</span></div>`).join("")||"<p class='muted'>No tools loaded</p>"}</div>
      <div class="driver-card tool-list-compact">${(r.tools||[]).slice(0,24).map(I=>`<div class="tool-chip">${e.esc(I.name)}${I.requires_approval?'<span class="badge-pill">approval</span>':""}</div>`).join("")}</div>
    </div>`}function W(){let r=e.state._crm||{},d=r.pipeline||{},w=r.contacts||[],I=r.followups_due||[],V=Object.entries(d).map(([h,$])=>`<div class="kv-row"><span class="k">${e.esc(h)}</span><span class="v">${$}</span></div>`).join(""),F=I.slice(0,8).map(h=>`<li>${e.esc(h.name)} <span class="muted">${e.esc(h.company||"")}</span></li>`).join("")||"<li class='muted'>None due</li>",U=w.slice(0,10).map(h=>`<tr><td>${e.esc(h.name)}</td><td>${e.esc(h.company||"\u2014")}</td><td>${e.esc(h.status||"\u2014")}</td></tr>`).join("");return`<div class="console-split">
      <section class="driver-card"><p class="caption-uppercase">Pipeline</p>${V||"<p class='muted'>Empty</p>"}
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Follow-ups due</p><ul class="list-plain">${F}</ul></section>
      <section class="driver-card"><p class="caption-uppercase">Contacts (${w.length})</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Company</th><th>Status</th></tr></thead>
        <tbody>${U||"<tr><td colspan='3' class='muted'>No contacts</td></tr>"}</tbody></table></div>
        <button type="button" class="button-outline-on-dark button-sm" data-goto="crm" style="margin-top:var(--space-xs)">Open CRM</button>
      </section>
    </div>`}function N(){let r=e.currentWorldId(),d=e.vaultReadyFor(r)?e.vaultPayload()||{}:{},w=d.folders||d.facets||[],I=e.state._agentsVaultQ||"",V=r!=="root"&&!e.vaultReadyFor(r);return`<div class="console-split">
      <section class="driver-card">
        <p class="caption-uppercase">Vault \xB7 ${e.esc(e.activeWorldLabel())}</p>
        ${V?"<p class='body-md muted' style='margin-top:var(--space-xs)'>Loading vault registry\u2026</p>":`<div class="vault-facet-grid" style="margin-top:var(--space-xs)">${w.map(F=>`<div class="vault-facet-card"><div class="vault-facet-head"><h4>${e.esc(F.domain_label||F.label||F.folder||"")}</h4><span class="badge-pill">${F.file_count??0} files</span></div></div>`).join("")||"<p class='muted'>Select a sub-world or link a repo in Worlds</p>"}</div>`}
        <button type="button" class="button-outline-on-dark button-sm" data-goto="world" style="margin-top:var(--space-sm)">Manage vault</button>
      </section>
      <section class="driver-card">
        <div class="search-row">
          <input type="search" class="text-input-on-dark" id="agents-vault-q" placeholder="Search vault\u2026" value="${e.esc(I)}">
          <button type="button" class="button-primary button-sm" id="agents-vault-search">Search</button>
        </div>
        <pre class="run-result mono" id="agents-vault-results" hidden></pre>
      </section>
    </div>`}function q(){let r=e.state.agentsTab||"runs",d=e.collectAgentRuns();if(r==="runs")return e.renderAgentRunsTable(d);if(r==="live"){let w=e.state.live||{};return e.renderLivePanel(w,"agents-tab-live")}return r==="tools"?e.renderAgentsToolsPanel():r==="crm"?e.renderAgentsCrmPanel():r==="vault"?e.renderAgentsVaultPanel():""}function z(){let r=e.state._agents||{},d=e.state.live||r.live||{},w=e.routingMeta(r),I=e.routingLabel(r),V=e.isDirectSpecialist(),F=e.state._delegateDraft||"",U=e.collectAgentRuns(),h=(e.state.approvals||[]).length,$=(r.specialists||[]).filter(K=>e.agentBusy(d,K.id)).length,T=r.skills||[],P=e.state.agentsTab||"runs",M=!!(e.state._delegateResult||"").trim(),Y=e.state._agentActions||[];return`<div class="agents-console">
      <header class="console-toolbar driver-card">
        <div class="console-kpis">
          <div class="console-kpi"><span class="console-kpi__val">${r.specialists?.length||5}</span><span class="console-kpi__lbl">Specialists</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${$||"0"}</span><span class="console-kpi__lbl">Active</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${U.length}</span><span class="console-kpi__lbl">Runs</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${r.total_tools||0}</span><span class="console-kpi__lbl">Tools</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${h}</span><span class="console-kpi__lbl">Approvals</span></div>
        </div>
        <div class="console-toolbar__actions">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          ${T.map(K=>`<span class="skill-chip${K.installed?"":" is-missing"}">${e.esc(K.name)}</span>`).join("")}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="approvals"${h?"":" disabled"}>Approvals${h?` (${h})`:""}</button>
        </div>
      </header>
  
      ${e.renderSupervisorBanner(r,d)}
  
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
        <div class="agent-picker-bar__cards">${e.renderAgentCards(r,d,!0)}</div>
      </section>
  
      <div class="agents-workspace">
        <section class="task-composer driver-card">
          <div class="task-composer__head">
            <div class="agent-card-title-row">
              ${e.agentAvatar(V?w.id:"supervisor",V?w.role:"aggregator")}
              <div>
                <h2 class="title-md">${V?e.esc(w.label):"Supervisor"}</h2>
                <p class="world-meta">${V?e.esc((w.brief||"").slice(0,100)):"Auto-route \u2014 supervisor will delegate to the best specialist"}</p>
              </div>
            </div>
            <span class="agent-status ${e.agentBusy(d,V?w.id:"supervisor")?"busy":"ready"}">${e.esc(I)}</span>
          </div>
          <textarea class="text-input-on-dark task-composer__input" id="delegate-selected" rows="3" placeholder="${V?`Task for ${e.esc(w.label)}\u2026`:"Message supervisor\u2026"}">${e.esc(F)}</textarea>
          <div class="task-composer__foot">
            <button type="button" class="button-primary" id="delegate-selected-btn">${V?`Run ${e.esc(w.label)}`:"Send to supervisor"}</button>
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
          ${e.renderLivePanel(d,"agents-live-panel")}
          <p class="caption-uppercase" style="margin-top:var(--space-sm)">Recent actions</p>
          <div class="action-feed">${Y.slice(0,8).map(K=>`<div class="action-feed__item"><span class="mono">${e.esc(K.tool_name)}</span><span class="muted">${e.esc((K.created_at||"").slice(11,16))}</span></div>`).join("")||"<p class='muted'>No actions yet</p>"}</div>
        </aside>
      </div>
  
      <section class="driver-card agents-panel">
        <div class="workspace-tabs">
          <button type="button" class="workspace-tab${P==="runs"?" is-active":""}" data-agents-tab="runs">Run history</button>
          <button type="button" class="workspace-tab${P==="live"?" is-active":""}" data-agents-tab="live">Live runtime</button>
          <button type="button" class="workspace-tab${P==="tools"?" is-active":""}" data-agents-tab="tools">Tools</button>
          <button type="button" class="workspace-tab${P==="crm"?" is-active":""}" data-agents-tab="crm">CRM</button>
          <button type="button" class="workspace-tab${P==="vault"?" is-active":""}" data-agents-tab="vault">Vault</button>
        </div>
        <div class="agents-tab-body">${e.renderAgentsTabPanel()}</div>
      </section>
    </div>`}function Z(){if(e.currentView!=="agents"||e.state.agentsTab!=="vault")return;let r=document.querySelector(".agents-console .console-split");r&&(r.outerHTML=e.renderAgentsVaultPanel())}function ae(r){let d=r||"";e.state.selectedSpecialist=d,localStorage.setItem("fos_selected_specialist",d),e.populateSpecialistSelect(),e.render()}async function J(){let r=e.$("#agents-vault-q")?.value?.trim();e.state._agentsVaultQ=r;let d=e.$("#agents-vault-results"),w=e.currentWorldId();if(!(!r||!w||w==="root"))try{let V=((await e.api(`/vault/search?${new URLSearchParams({q:r,world_id:w})}`)).hits||[]).map(F=>`[${F.metadata?.domain||"?"}] ${F.metadata?.source||""}
${(F.text||"").slice(0,240)}`).join(`

---

`)||"No hits.";d&&(d.textContent=V,d.hidden=!1)}catch(I){d&&(d.textContent=I.message,d.hidden=!1)}}async function C(){let r=e.currentSpecialistId(),d=e.$("#delegate-selected"),w=(d?.value||"").trim();if(!w)return;let I=e.$("#delegate-selected-btn"),V=e.routingMeta(e.state._agents||{}),F=!!r,U=Date.now();I&&(I.disabled=!0,I.textContent="Running\u2026"),e.startLivePoll(),e.state.agentsTab="live",localStorage.setItem("fos_agents_tab","live"),e.state._delegateResult="Agent working\u2026",e.render();try{let h=await e.api("/chat/async",{method:"POST",body:JSON.stringify(e.chatPayload({message:w,specialist:F?r:void 0})),timeoutMs:2e4}),$=await e.pollAgentJob(h.job.id),T=$?.job,P=T?.result||T?.error||"(no response)";e.state._delegateResult=P,e.state._delegateDraft="",d&&(d.value=""),T?.session_id&&e.setChatSessionId(T.session_id),e.persistAgentRun({id:T?.run_id||`local-${U}`,agent:F?r:"supervisor",task:w,result:P,duration_s:T?.elapsed_s||Math.round((Date.now()-U)/1e3),ts:Math.floor(U/1e3),tools:(T?.events||[]).filter(M=>M.name).map(M=>M.name),source:"delegate",artifacts:T?.artifacts}),e.state.agentsTab="runs",localStorage.setItem("fos_agents_tab","runs"),e.state.expandedRunId=T?.run_id||`local-${U}`,$?.pending_approvals&&(e.state.approvals=$.pending_approvals,e.updateBadges())}catch(h){e.state._delegateResult="Error: "+h.message}I&&(I.disabled=!1,I.textContent=F?`Run ${V.label}`:"Send to supervisor");try{let h=await e.api("/agents/runs");e.state._agentRunsApi=h.runs||[],e.state._agentActions=h.actions||[]}catch{}e.state._activeJob=null,e.pollLive(),e.render(),e.drawGraphs()}e.supervisorMeta=S,e.listSpecialists=k,e.populateSpecialistSelect=b,e.routingLabel=a,e.routingMeta=p,e.agentBusy=u,e.agentRoleBadge=m,e.agentAvatar=n,e.lastRunForAgent=t,e.collectAgentRuns=s,e.persistAgentRun=l,e.renderFleetAutoCard=i,e.renderSupervisorBanner=g,e.renderFleetCard=D,e.renderAgentCards=A,e.renderFleetCardInner=v,e.renderAgentRunsTable=y,e.renderAgentsToolsPanel=L,e.renderAgentsCrmPanel=W,e.renderAgentsVaultPanel=N,e.renderAgentsTabPanel=q,e.renderAgents=z,e.patchAgentsVaultPanel=Z,e.selectSpecialist=ae,e.agentsVaultSearch=J,e.delegateAgent=C}function Se(e){function S(o){let c=e.state.worlds||e.state._worldFull?.worlds||{},f=c.root,_=c.children||[],R=o||"",G=`<option value="root"${R==="root"||!R?" selected":""}>${e.esc(f?.name||"Main world")}</option>`;return G+=_.map(O=>`<option value="${e.esc(O.id)}"${R===O.id?" selected":""}>${e.esc(O.name)} \xB7 ${e.esc(O.kind||"project")}</option>`).join(""),G}function k(o,c){let f=o?.facets||o?.folders||[],_=[];for(let R of f)for(let G of R.documents||[])G.github_repo===c&&_.push(G);return _.sort((R,G)=>(R.github_path||R.filename||"").localeCompare(G.github_path||G.filename||""))}function b(o){let c=o.filter(f=>{let _=f.github_path||f.filename||"";return/^readme\.md$/i.test(_.split("/").pop()||"")});return c.length?c.sort((f,_)=>(f.github_path||f.filename||"").length-(_.github_path||_.filename||"").length)[0]:null}function a(o){let c=(o.files||[]).length;for(let f of Object.keys(o.dirs||{}))c+=e.countGithubTreeFiles(o.dirs[f]);return c}function p(o,c,f=0){let _=Object.keys(o.dirs||{}).sort(),R=(o.files||[]).sort((O,B)=>O._fileName.localeCompare(B._fileName)),G="";for(let O of _){let B=o.dirs[O],Q=e.countGithubTreeFiles(B);G+=`<details class="github-tree-dir"${f<2?" open":""}>
        <summary><span class="mono">${e.esc(O)}</span> <span class="muted">${Q} file${Q!==1?"s":""}</span></summary>
        <div class="github-tree">${e.renderGithubTreeNode(B,c,f+1)}</div>
      </details>`}for(let O of R){let B=O.github_path||O.filename||O.title,Q=/^readme\.md$/i.test((B||"").split("/").pop()||"");G+=`<div class="github-tree-file">
        <span class="github-tree-file__path mono${Q?" is-readme":""}">${e.esc(B)}</span>
        <span class="github-tree-file__actions">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-view-doc="${O.id}" data-world-id="${e.esc(c)}" data-doc-title="${e.esc(O.title||B)}">View</button>
          <button type="button" class="button-primary button-sm" data-tag-vault-doc="${O.id}" data-world-id="${e.esc(c)}" data-doc-title="${e.esc(O.title||B)}" data-doc-path="${e.esc(B)}">Tag in agent</button>
        </span>
      </div>`}return G}function u(o,c,f,_){e.state._chatAttachments||(e.state._chatAttachments=[]);let R=Number(o);e.state._chatAttachments.some(G=>G.doc_id===R)||e.state._chatAttachments.push({type:"vault",doc_id:R,title:f||_||"Document",path:_||"",world_id:c}),e.goView("chat")}function m(o,c){if(o?.nodes&&o?.edges)return o;let f=o?.vault||o||{},_=c||{},R=[],G=[],O=_.id||f.world_id||"world",B=`vault-world:${O}`;return R.push({data:{id:B,label:(_.name||"World").slice(0,36),type:"world_root",world_id:O}}),(f.facets||f.folders||[]).forEach(E=>{let X=E.id||E.folder||"slot",j=`vault-facet:${O}:${X}`,te=`${E.label||E.folder||"Folder"} (${E.file_count||0})`;R.push({data:{id:j,label:te.slice(0,40),type:"vault_facet",facet_id:X,folder:E.folder}}),G.push({data:{source:B,target:j,label:"folder"}}),(E.documents||[]).slice(0,14).forEach((x,ee)=>{let se=`vault-doc:${x.id||ee}`;R.push({data:{id:se,label:(x.title||x.filename||"Document").slice(0,36),type:"vault_file",doc_id:x.id,facet_id:X,source:x.source_type||"upload"}}),G.push({data:{source:j,target:se,label:"doc"}})}),(E.files||[]).slice(0,8).forEach((x,ee)=>{let se=`vault-disk:${O}:${X}:${ee}`;R.push({data:{id:se,label:(x.name||x.relative||"file").slice(0,32),type:"vault_file",path:x.relative,facet_id:X,source:"disk"}}),G.push({data:{source:j,target:se,label:"disk"}})})}),(f.github_repos||[]).slice(0,10).forEach(E=>{let X=`gh-repo:${E.id}`;R.push({data:{id:X,label:(E.full_name||"repo").split("/").pop().slice(0,28),type:"vault_repo",link_id:E.id,repo:E.full_name}}),G.push({data:{source:B,target:X,label:"github"}})}),R.length<=1&&(R.push({data:{id:"vault-empty",label:"Add docs or link GitHub",type:"empty"}}),G.push({data:{source:B,target:"vault-empty",label:"start"}})),{nodes:R,edges:G}}function n(o){let c=o?.id;if(!c||c==="root")return{nodes:[],edges:[]};if(e.state._vaultLoading&&e.state._vaultWorldId!==c)return{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]};if(e.state._vaultWorldId===c&&e.state._vaultGraph?.nodes?.length)return e.state._vaultGraph;let f=e.vaultReadyFor(c)?e.vaultPayload():null;return f?e.buildVaultGraph(f,o):e.state._vaultLoading?{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]}:{nodes:[{data:{id:"vault-empty",label:"Vault not loaded",type:"empty"}}],edges:[]}}function t(o){return o==="vault"?`
        <span><i style="border-color:#051f13"></i> World</span>
        <span><i style="border-color:#00666b"></i> Folder</span>
        <span><i style="border-color:#8f706b;border-radius:50%"></i> File</span>
        <span><i style="border-color:#f75440;background:#2d312e"></i> GitHub</span>`:`
      <span><i style="border-color:#051f13"></i> Main</span>
      <span><i style="border-color:#f75440"></i> Project</span>
      <span><i style="border-color:#ffb4a8"></i> Idea</span>
      <span><i style="border-color:#00666b"></i> Research</span>
      <span><i style="border-color:#f75440;background:#f7544033"></i> Active</span>`}function s(o="world-create-form"){return`
      <form class="world-form human-form" id="${e.esc(o)}">
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
      </form>`}function l(o){let c=e.worldTreeData(),f=o||"root";return f==="root"||f===c.root?.id?c.root||null:(c.children||[]).find(_=>_.id===f)||null}function i(){return e.state.inspectorWorldId||e.currentWorldId()||"root"}async function g(o,{force:c=!1}={}){if(!o||o==="root"){e.clearVaultScopedState(),e.invalidateGraphCache("graph-world");return}if(!c&&e.vaultReadyFor(o))return;let f=++e.vaultLoadGen;e.state._vaultLoading=!0,e.state._vaultWorldId=o,e.currentView==="world"&&e.patchWorldPanels();try{let _=await e.api(`/worlds/${encodeURIComponent(o)}/vault`);if(f!==e.vaultLoadGen)return;e.state._worldVault=_.vault||null,e.state._vaultGraph=_.vault_graph||null,e.state._vaultWorldId=o,e.invalidateGraphCache("graph-world")}catch{if(f!==e.vaultLoadGen)return;e.clearVaultScopedState()}finally{f===e.vaultLoadGen&&(e.state._vaultLoading=!1)}}async function D(o,c={}){if(!o||o==="root"){e.clearVaultScopedState();return}c.force&&(e.state._vaultWorldId=null),await e.loadWorldVault(o,{force:!0})}async function A(){try{let o=await e.api("/graph/world");e.state._worldFull=o,e.state._worldGraph=o?.graph??null,e.state._worldHierarchyGraph=o?.hierarchy_graph??null,e.state._worldPreviews=o?.world_previews??{},o?.worlds&&(e.state.worlds=o.worlds),e.populateWorldSelect(),e.invalidateGraphCache("graph-world")}catch(o){console.warn("world tree reload failed:",o)}}async function v(o,c={}){if(!o||o==="root"){e.clearVaultScopedState();return}!c.force&&e.vaultReadyFor(o)||await e.loadWorldVault(o,{force:!!c.force})}function y(){let o=e.inspectorWorldId(),c=e.state.activeWorldId||"root";e.$$("[data-inspect-world]").forEach(_=>{let R=_.dataset.inspectWorld;_.classList.toggle("is-inspect",R===o),_.classList.toggle("is-active",R===c)});let f=document.querySelector(".worlds-stat [data-active-world-label]");f&&(f.textContent=e.activeWorldLabel())}function L(){if(e.currentView!=="world")return;let o=e.inspectorWorldId(),c=e.worldById(o),f=e.state._worldFull?.snapshot||e.state.snapshot||{},_=document.getElementById("world-inspector");_&&(_.innerHTML=e.renderWorldInspector(c,f));let R=document.getElementById("world-vault-mount");if(e.isRootWorld(c))R&&(R.innerHTML="");else{let G=e.renderWorldVaultPanel(c);R&&(R.innerHTML=G)}e.patchWorldTreeNav(),e.drawGraphs()}async function W(o={}){let c=e.currentWorldId(),f=e.inspectorWorldId(),_=o.vaultWorldId||(e.currentView==="world"?f:c);!_||_==="root"?e.clearVaultScopedState():await e.ensureVaultForWorld(_,{force:!!o.forceVault}),e.currentView==="world"&&o.reloadTree?await e.reloadWorldTree():(e.currentView==="world"||e.currentView==="dashboard")&&await e.loadGraphData(),e.drawGraphs()}function N(o){let c=o||"root";e.inspectorWorldId()===c&&e.vaultReadyFor(c)&&!e.state._vaultLoading||(e.state.inspectorWorldId=c,e.currentView==="world"&&(e.state._motionSkipOnce=!0,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.patchWorldPanels(),e.reloadVault(c,{force:!0}).then(()=>{e.patchWorldPanels(),FOSMotion?.flashElement?.(e.$("#world-inspector")),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())}).catch(console.error)))}function q(o,c,f,_){let R=o?.id||"root",G=`
      <button type="button" class="world-tree-item is-root${f===R?" is-inspect":""}${_===R?" is-active":""}"
        data-inspect-world="${e.esc(R)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(o?.name||"Main world")}</span>
          <span class="sub">Top-level \xB7 all ventures</span>
        </span>
      </button>`,O=c.map(B=>`
      <button type="button" class="world-tree-item kind-${e.esc(B.kind||"project")}${f===B.id?" is-inspect":""}${_===B.id?" is-active":""}"
        data-inspect-world="${e.esc(B.id)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(B.name)}</span>
          <span class="sub">${e.esc(B.kind||"project")} \xB7 ${e.esc((B.description||"No description").slice(0,42))}</span>
        </span>
      </button>`).join("");return`
      <nav class="world-tree-nav" aria-label="World hierarchy">
        ${G}
        ${c.length?`<div class="world-tree-children">${O}</div>`:""}
      </nav>`}function z(o,c){if(!o)return'<p class="body-md muted">Select a world to inspect its context.</p>';let f=o.id||"root",_=f==="root",R=_?"root":o.kind||"project",G=e.currentWorldId(),B=(e.state._worldPreviews||e.state._worldFull?.world_previews||{})[f]||"",Q=c?.crm||{},E=c?.finance||{};if(e.state.worldEditing===f)return`
        <form class="world-edit-form" id="world-edit-form" data-world-id="${e.esc(f)}">
          <div class="world-inspector-title">
            <h2>Edit ${e.esc(o.name)}</h2>
            ${e.worldKindBadge(R)}
          </div>
          ${_?`
            <label>Name<input class="text-input-on-dark" name="name" value="${e.esc(o.name||"")}"></label>`:`
            <label>Name<input class="text-input-on-dark" name="name" value="${e.esc(o.name||"")}" required></label>
            <label>Category
              <select class="text-input-on-dark" name="kind" id="world-edit-kind">
                <option value="project"${o.kind==="project"?" selected":""}>Startup / venture</option>
                <option value="idea"${o.kind==="idea"?" selected":""}>Idea</option>
                <option value="research"${o.kind==="research"?" selected":""}>Technical research</option>
                <option value="technical"${o.kind==="technical"?" selected":""}>Technical project</option>
              </select>
            </label>
            <label>Knowledge template
              <select class="text-input-on-dark" name="template" id="world-edit-template">
                ${(e.state._worldTemplates||[]).map(ee=>`<option value="${e.esc(ee.id)}"${(o.template||"")===ee.id?" selected":""}>${e.esc(ee.label)}</option>`).join("")||`<option value="startup"${(o.template||"startup")==="startup"?" selected":""}>Startup / venture</option>`}
              </select>
            </label>`}
          <label>Description<textarea class="text-input-on-dark" name="description" rows="2">${e.esc(o.description||"")}</textarea></label>
          <label>Agent context<textarea class="text-input-on-dark" name="context" rows="5">${e.esc(o.context||"")}</textarea></label>
          <div class="world-inspector-actions">
            <button type="submit" class="button-primary button-sm">Save</button>
            <button type="button" class="button-tertiary-text button-sm" data-cancel-edit>Cancel</button>
          </div>
        </form>`;let j=_?[["Contacts",Q.total_contacts||0],["Follow-ups",Q.followups_due||0],["Open tasks",c?.tasks_open||0],["Approvals",c?.approvals_pending||0]]:[];_&&E?.set&&j.push(["Runway",E.runway_months!=null?`${E.runway_months} mo`:"\u2014"]);let te=_?e.worldTreeData().children||[]:[],x=(c?.goals_active||[]).slice(0,5);return`
      <div class="world-inspector-title">
        <div>
          <h2>${e.esc(o.name)}</h2>
          <p class="world-meta">id: ${e.esc(f)}${o.updated_at?` \xB7 updated ${e.esc(o.updated_at)}`:""}</p>
        </div>
        ${e.worldKindBadge(R)}
      </div>
      ${G===f?'<p class="world-meta" style="color:var(--color-primary)">\u25CF Active for chat &amp; agents</p>':'<p class="world-meta">Not active \u2014 switch from the top bar or below</p>'}
      <div class="world-inspector-section">
        <h4>Description</h4>
        <p>${e.esc(o.description||"No description yet.")}</p>
      </div>
      <div class="world-inspector-section">
        <h4>Agent context</h4>
        <p>${e.esc(o.context||"No focused context \u2014 add what the agent should know in this world.")}</p>
      </div>
      ${j.length?`
        <div class="world-inspector-section">
          <h4>Global snapshot</h4>
          <div class="world-inspector-facts">${j.map(([ee,se])=>`<div class="world-inspector-fact"><span class="k">${e.esc(ee)}</span><span class="v">${e.esc(String(se))}</span></div>`).join("")}</div>
        </div>`:""}
      ${_&&te.length?`
        <div class="world-inspector-section">
          <h4>Sub-worlds indexed (${te.length})</h4>
          <div class="world-inspector-facts">${te.map(ee=>`<div class="world-inspector-fact"><span class="k">${e.esc(ee.name)}</span><span class="v">${e.esc(ee.kind||"project")}</span></div>`).join("")}</div>
        </div>`:""}
      ${_?"":`
        <div class="world-inspector-section">
          <h4>Template</h4>
          <p class="body-md">${e.esc(o.template||R)} \u2014 facet folders on disk under <code class="mono">data/knowledge/</code></p>
          ${o.github_repo?`<p class="world-meta">GitHub: ${e.esc(o.github_repo)}</p>`:""}
          ${o.repo_path?`<p class="world-meta">Repo: ${e.esc(o.repo_path)}</p>`:""}
        </div>`}
      ${!_&&e.worldTreeData().root?`
        <div class="world-inspector-section">
          <h4>Parent</h4>
          <p class="body-md">${e.esc(e.worldTreeData().root.name)} <span class="world-meta">(main world)</span></p>
        </div>`:""}
      ${x.length&&_?`
        <div class="world-inspector-section">
          <h4>Active goals</h4>
          <p class="body-md">${x.map(ee=>e.esc(typeof ee=="string"?ee:ee.title||ee)).join(" \xB7 ")}</p>
        </div>`:""}
      <div class="world-inspector-section">
        <h4>What the agent sees</h4>
        <pre class="world-context-preview">${e.esc(B||"Preview loads when graph data is fetched\u2026")}</pre>
      </div>
      <div class="world-inspector-actions">
        <button type="button" class="button-primary button-sm" data-use-world="${e.esc(f)}">Use in chat</button>
        <button type="button" class="button-outline-on-dark button-sm" data-set-active-world="${e.esc(f)}">Set active</button>
        <button type="button" class="button-tertiary-text button-sm" data-edit-world="${e.esc(f)}">Edit</button>
        ${_?"":`<button type="button" class="button-tertiary-text button-sm" data-delete-world="${e.esc(f)}">Delete</button>`}
      </div>`}function Z(o,c,f){let _=e.state.ui?.vaultDocEdit,R=f||c[0]?.id||c[0]?.folder||"docs",G=c.find(E=>(E.id||E.folder)===R)||c[0]||{label:R,id:R},O=_&&_.title||"",B=_&&_.description||"",Q=_?.id||"";return`
      <form class="human-form vault-doc-form" id="vault-doc-form" data-world-id="${e.esc(o.id)}" data-facet-id="${e.esc(R)}">
        ${Q?`<input type="hidden" name="doc_id" value="${Q}">`:""}
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Category slot</span>
            <select class="text-input-on-dark" name="facet_id" id="vault-doc-facet">
              ${c.map(E=>{let X=E.id||E.folder;return`<option value="${e.esc(X)}"${X===R?" selected":""}>${e.esc(E.label)}</option>`}).join("")}
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Title</span>
            <input class="text-input-on-dark" name="title" required placeholder="e.g. Current ICP" value="${e.esc(O)}"></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description (indexed for search)</span>
          <textarea class="text-input-on-dark" name="description" rows="3" placeholder="Short summary agents use to find this doc. Full content goes to ${e.esc(e.vaultStorageLabel())}.">${e.esc(B)}</textarea></label>
        ${Q?`
        <label class="human-field"><span class="caption-uppercase">Document body (markdown)</span>
          <textarea class="text-input-on-dark" name="content" id="vault-doc-content" rows="8" placeholder="Loading\u2026"></textarea></label>`:`
        <label class="human-field"><span class="caption-uppercase">Upload file</span>
          <input type="file" name="file" accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json"></label>
        <label class="human-field"><span class="caption-uppercase">Or paste markdown</span>
          <textarea class="text-input-on-dark" name="content" rows="6" placeholder="# ICP

Target: \u2026"></textarea></label>`}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm">${Q?"Update document":"Add document"}</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-cancel-doc>Cancel</button>
        </div>
        <p class="world-meta">Slot: <strong>${e.esc(G.label)}</strong> \xB7 Full files in ${e.esc(e.vaultStorageLabel())}; only title + description in vector index.</p>
      </form>`}function ae(o,c){let f=e.state._githubStatus||{},_=!!f.connected,R=!!f.oauth_configured,G=c.github_repos||[],B=(e.state._githubRepos||[]).map(E=>`<option value="${e.esc(E.full_name)}">${e.esc(E.full_name)}${E.private?" (private)":""}</option>`).join(""),Q=G.map(E=>{let X=e.isLinkSyncing(E.id),j=e.githubRepoDocuments(c,E.full_name),te=e.findReadmeDoc(j),x=j.filter(se=>e.isMarkdownFilename(se.github_path||se.filename)),ee=x.length?`<div class="github-tree github-tree--repo">${e.renderGithubTreeNode(e.buildGithubPathTree(x),o.id)}</div>`:"";return`
      <div class="github-repo-row">
        <div>
          <strong class="mono">${e.esc(E.full_name)}</strong>
          ${X?'<span class="sync-badge">Syncing</span>':""}
          <span class="world-meta">${E.file_count||j.length||0} files synced${E.synced_at?` \xB7 ${e.esc(E.synced_at)}`:""}</span>
          ${E.last_error?`<span class="world-meta" style="color:var(--color-warn)">${e.esc(E.last_error)}</span>`:""}
        </div>
        <div class="github-repo-row__actions">
          <button type="button" class="button-primary button-sm" data-vault-view-doc="${te?.id||""}" data-world-id="${e.esc(o.id)}" data-doc-title="${e.esc(te?.title||`${E.full_name} README`)}"${!te||X?" disabled":""}>Open README</button>
          <button type="button" class="button-outline-on-dark button-sm${X?" is-busy":""}" data-github-sync="${E.id}" data-world-id="${e.esc(o.id)}"${X?" disabled":""}>${X?"Syncing\u2026":`Sync to ${e.esc(e.vaultStorageLabel())}`}</button>
          <button type="button" class="button-tertiary-text button-sm" data-github-unlink="${E.id}" data-world-id="${e.esc(o.id)}"${X?" disabled":""}>Unlink</button>
        </div>
        ${j.length?`<details class="github-repo-files" open>
          <summary class="caption-uppercase">Repo structure \xB7 ${x.length} markdown file${x.length===1?"":"s"}</summary>
          ${ee||"<p class='muted body-md'>No markdown files synced yet.</p>"}
        </details>`:'<p class="body-md muted github-repo-files-empty">No files synced yet \u2014 link and sync to browse the repo tree here.</p>'}
      </div>`}).join("");return R?_?`<section class="github-repos-panel">
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
            ${B}
          </select>
        </label>
        <button type="button" class="button-primary button-sm" data-github-add="${e.esc(o.id)}"${e.state._syncingLinkIds.size?" disabled":""}>Link &amp; sync</button>
      </div>
      <div class="github-repo-list">${Q||"<p class='body-md muted'>No GitHub repos linked yet.</p>"}</div>
    </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub repositories</p>
        <p class="body-md muted">Authorize GitHub to browse your repos and sync docs into this world's knowledge graph (${e.esc(e.vaultStorageLabel())}).</p>
        <a class="button-primary button-sm" href="/api/github/auth/start?world_id=${encodeURIComponent(o.id)}">Connect GitHub</a>
      </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub</p>
        <p class="body-md muted">Add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to <code>.env</code>, register callback <code>${e.esc(f.redirect_uri||"/api/github/callback")}</code>, then restart.</p>
      </section>`}function J(o,c){let f=o.facets||o.folders||[],_=o.storage_backend||(e.vaultStorageLabel()==="S3"?"s3":"local");return`
      <div class="vault-registry-bar" role="status" aria-live="polite">
        <span class="vault-registry-chip"><span class="k">Template</span> ${e.esc(o.template_id||c.template||"startup")}</span>
        <span class="vault-registry-chip"><span class="k">Slots</span> ${f.length}</span>
        <span class="vault-registry-chip"><span class="k">Docs</span> ${o.document_count||0}</span>
        <span class="vault-registry-chip"><span class="k">Storage</span> ${e.esc(_)}</span>
        <button type="button" class="button-tertiary-text button-sm" data-vault-reload="${e.esc(c.id)}">Reload registry</button>
      </div>`}function C(o){if(!o||o.id==="root")return"";if(e.state._vaultLoading||e.state._vaultWorldId!==o.id)return`
      <section class="driver-card vault-panel knowledge-panel panel-loading" style="margin-top:var(--space-md)">
        <p class="section-eyebrow">Knowledge vault</p>
        <h3 class="title-sm">${e.esc(o.name)}</h3>
        <div class="skeleton-grid" style="margin-top:var(--space-sm)">
          ${e.skeletonCard(3)}${e.skeletonCard(3)}${e.skeletonCard(3)}
        </div>
      </section>`;let c=e.vaultPayload()||{},f=c.facets||c.folders||[],_=c.domain_counts||{},R=e.state.ui?.vaultFacet||f[0]?.id||f[0]?.folder||null,G=e.state.ui?.vaultDocForm||e.state.ui?.vaultDocEdit,O=(f.find(j=>(j.id||j.folder)===R)||{}).documents||[],B=f.map(j=>{let te=j.id||j.folder,x=(j.documents||[]).length+(j.files||[]).length;return`<button type="button" class="vault-facet-tab${te===R?" is-active":""}" data-vault-facet="${e.esc(te)}">${e.esc(j.label)} <span class="badge-pill">${x}</span></button>`}).join(""),Q=O.map(j=>{let te=j.github_path?` \xB7 ${j.github_path}`:"",x=e.isMarkdownFilename(j.filename||j.github_path);return`
      <article class="vault-doc-card" data-doc-id="${j.id}">
        <div class="vault-doc-card__head">
          <h4>${e.esc(j.title)}</h4>
          <span class="world-meta">${e.esc(j.filename||"")}${e.esc(te)} \xB7 ${e.formatBytes(j.size_bytes)}${j.source_type==="github"?" \xB7 GitHub":""}</span>
        </div>
        <p class="body-md">${e.esc(j.description||"No description")}</p>
        <div class="vault-doc-card__actions">
          ${x?`<button type="button" class="button-primary button-sm" data-vault-view-doc="${j.id}" data-world-id="${e.esc(o.id)}" data-doc-title="${e.esc(j.title)}">View</button>`:""}
          <button type="button" class="button-outline-on-dark button-sm" data-tag-vault-doc="${j.id}" data-world-id="${e.esc(o.id)}" data-doc-title="${e.esc(j.title)}" data-doc-path="${e.esc(j.github_path||j.filename||"")}">Tag in agent</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-edit-doc="${j.id}">Edit</button>
          <button type="button" class="button-tertiary-text button-sm" data-vault-delete-doc="${j.id}">Remove</button>
        </div>
      </article>`}).join(""),E=(f.find(j=>(j.id||j.folder)===R)||{}).files||[],X=E.length?`<ul class="vault-file-list">${E.map(j=>`<li class="mono">${e.esc(j.relative||j.name)} <span class="muted">on disk</span></li>`).join("")}</ul>`:"";return`
      <section class="driver-card vault-panel knowledge-panel" style="margin-top:var(--space-md)">
        <div class="vault-panel-head">
          <div>
            <p class="section-eyebrow">Knowledge graph</p>
            <h3 class="title-sm">${e.esc(o.name)} \u2014 ${e.esc(c.template_id||o.template||"startup")} template</h3>
            <p class="body-md muted">Category slots for this world type. Add docs with a searchable description; large files live in ${e.esc(e.vaultStorageLabel())}. Open the <strong>Files</strong> tab in the map above for the folder graph.</p>
            <p class="world-meta">${c.document_count||0} registered docs \xB7 ${e.esc(c.vault_path||"")}${c.repo_path?` \xB7 repo: ${e.esc(c.repo_path)}`:""}</p>
          </div>
          <div class="vault-panel-actions">
            <button type="button" class="button-primary button-sm" data-vault-add-doc="${e.esc(o.id)}">Add document</button>
            <button type="button" class="button-outline-on-dark button-sm" data-world-graph-tab="vault">Open file map</button>
            <input class="text-input-on-dark" id="vault-repo-path" placeholder="Local repo path" value="${e.esc(o.repo_path||"")}">
            <button type="button" class="button-outline-on-dark button-sm" data-vault-link="${e.esc(o.id)}">Link repo</button>
            <button type="button" class="button-outline-on-dark button-sm" data-vault-ingest="${e.esc(o.id)}">Re-ingest</button>
          </div>
        </div>
        ${e.renderGithubReposPanel(o,c)}
        ${e.renderVaultRegistryBar(c,o)}
        <div class="vault-facet-tabs" role="tablist">${B||"<span class='muted'>No categories</span>"}</div>
        ${G?e.renderVaultDocForm(o,f,R):""}
        <div class="vault-doc-grid">${Q||"<p class='body-md muted'>No documents in this slot yet \u2014 add your ICP, GTM notes, research, etc.</p>"}</div>
        ${X}
        <div class="vault-search-row">
          <input class="text-input-on-dark" id="vault-search-q" placeholder="Search descriptions in this world\u2026">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-search="${e.esc(o.id)}">Search</button>
        </div>
        <pre class="vault-search-results mono" id="vault-search-results" hidden></pre>
      </section>`}function r(){let o=e.state._worldFull||{},c=o.worlds||e.state.worlds||{},f=c.root||{},_=c.children||[],R=e.inspectorWorldId(),G=e.currentWorldId(),O=e.worldById(R)||f,B=o.snapshot||e.state.snapshot||{},Q=e.state.config?.my_name||"You";e.isRootWorld(O)&&e.worldGraphTab==="vault"&&(e.worldGraphTab="hierarchy");let E=!e.isRootWorld(O);return`
      <div class="worlds-page">
        <section class="worlds-hero">
          <div class="worlds-hero-lead">
            <h2>${e.esc(Q)}'s world map</h2>
            <p><strong>Your venture map</strong> \u2014 create worlds, set context, link doc repos, and switch active context. You define each world; agents read what you write.</p>
          </div>
          <div class="worlds-stat">
            <span class="n">${_.length+1}</span>
            <span class="l">Worlds</span>
          </div>
          <div class="worlds-stat">
            <span class="n">${_.length}</span>
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
              ${e.renderWorldTreeNav(f,_,R,G)}
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
              ${e.renderWorldInspector(O,B)}
            </div>
          </section>
        </div>
  
        ${e.isRootWorld(O)?"":`<div id="world-vault-mount">${e.renderWorldVaultPanel(O)}</div>`}
  
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
      </div>`}function d(o){return!o||o.id==="root"}async function w(o){let c=new FormData(o),f=(c.get("name")||"").toString().trim();if(f)try{let _=await e.api("/worlds",{method:"POST",body:JSON.stringify({name:f,kind:(c.get("kind")||"project").toString(),template:(c.get("template")||"").toString().trim()||void 0,description:(c.get("description")||"").toString().trim(),context:(c.get("context")||"").toString().trim(),repo_path:(c.get("repo_path")||"").toString().trim(),github_repo:(c.get("github_repo")||"").toString().trim()})});e.state.worlds=_.tree,e.setActiveWorld(_.world?.id),await e.refresh(),e.currentView==="world"&&(await e.reloadWorldTree(),e.selectInspectorWorld(_.world?.id)),o.reset(),e.state.ui&&(e.state.ui.worldCreateOpen=!1)}catch(_){alert(_.message)}}async function I(o){let c=o.dataset.worldId;if(!c)return;let f=new FormData(o),_={name:(f.get("name")||"").toString().trim(),description:(f.get("description")||"").toString(),context:(f.get("context")||"").toString()};if(c!=="root"){_.kind=(f.get("kind")||"project").toString();let R=(f.get("template")||"").toString().trim();R&&(_.template=R)}try{let R=await e.api(`/worlds/${encodeURIComponent(c)}`,{method:"PATCH",body:JSON.stringify(_)});e.state.worlds=R.tree,e.state.worldEditing=null,e.currentView==="world"?(await e.reloadWorldTree(),await e.reloadVault(c,{force:!0}),e.patchWorldPanels()):await e.refresh()}catch(R){alert(R.message)}}async function V(o){let c=o.dataset.worldId,f=(o.querySelector("[name=doc_id]")?.value||"").trim(),_=new FormData(o),R=(_.get("title")||"").toString().trim(),G=(_.get("facet_id")||o.dataset.facetId||"docs").toString(),O=(_.get("description")||"").toString().trim(),B=(_.get("content")||"").toString(),Q=o.querySelector('input[type="file"]')?.files?.[0];try{if(f)await e.api(`/worlds/${encodeURIComponent(c)}/vault/documents/${encodeURIComponent(f)}`,{method:"PATCH",body:JSON.stringify({title:R,description:O,facet_id:G,content:B||void 0})});else if(Q){let E=new FormData;E.append("file",Q),E.append("title",R),E.append("description",O),E.append("facet_id",G),await e.apiUpload(`/worlds/${encodeURIComponent(c)}/vault/documents`,E)}else if(B.trim())await e.api(`/worlds/${encodeURIComponent(c)}/vault/documents`,{method:"POST",body:JSON.stringify({title:R,description:O,facet_id:G,content:B})});else return alert("Upload a file or paste markdown content.");e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),await e.reloadVault(c,{force:!0}),e.afterVaultMutation(c)}catch(E){alert(E.message)}}async function F(o,c){e.state.ui||(e.state.ui={});try{let f=await e.api(`/worlds/${encodeURIComponent(o)}/vault/documents/${encodeURIComponent(c)}/content`);e.state.ui.vaultDocEdit=f.document,e.state.ui.vaultDocForm=!0,e.state.ui.vaultFacet=f.document?.facet_id||e.state.ui.vaultFacet,e.currentView==="world"?e.patchWorldPanels():e.render();let _=e.$("#vault-doc-content");_&&(_.value=f.content||"")}catch(f){alert(f.message)}}async function U(o){let c=e.$("#github-repo-pick")?.value?.trim();if(!c)return alert("Select a repository");let f=document.querySelector(`[data-github-add="${o}"]`);f&&(f.disabled=!0);try{let _=await e.api(`/worlds/${encodeURIComponent(o)}/repos`,{method:"POST",body:JSON.stringify({full_name:c}),timeoutMs:12e4});if(_.job?.status==="failed")throw new Error(_.job.message||"Could not start sync");_.job?.id?await e.runGithubSyncJob(_.job.id,`Syncing ${c}`,{worldId:o,linkId:_.repo?.id}):(await e.reloadVault(o,{force:!0}),e.afterVaultMutation(o))}catch(_){alert(_.message)}finally{f&&(f.disabled=e.state._syncingLinkIds.size>0)}}async function h(o,c){if(!e.isLinkSyncing(c))try{let f=await e.api(`/worlds/${encodeURIComponent(o)}/repos/${encodeURIComponent(c)}/sync`,{method:"POST",body:"{}",timeoutMs:12e4});if(f.job?.status==="failed")throw new Error(f.job.message||"Could not start sync");if(f.job?.id){let _=(e.state._worldVault?.github_repos||[]).find(R=>String(R.id)===String(c))?.full_name||"repository";await e.runGithubSyncJob(f.job.id,`Re-syncing ${_}`,{worldId:o,linkId:c})}}catch(f){alert(f.message)}}async function $(o,c){if(confirm("Unlink this repo and remove its synced documents from this world?"))try{await e.api(`/worlds/${encodeURIComponent(o)}/repos/${encodeURIComponent(c)}`,{method:"DELETE"}),await e.reloadVault(o,{force:!0}),e.afterVaultMutation(o)}catch(f){alert(f.message)}}async function T(o,c){if(confirm("Remove this document from the knowledge graph?"))try{await e.api(`/worlds/${encodeURIComponent(o)}/vault/documents/${encodeURIComponent(c)}`,{method:"DELETE"}),await e.reloadVault(o,{force:!0}),e.afterVaultMutation(o)}catch(f){alert(f.message)}}async function P(o){try{let c=await e.api(`/worlds/${encodeURIComponent(o)}/vault/ingest`,{method:"POST",body:"{}"});alert(`Ingested ${c.files||0} files (${c.total_chunks||0} chunks)`),await e.reloadVault(o,{force:!0}),e.afterVaultMutation(o)}catch(c){alert(c.message)}}async function M(o){let c=e.$("#vault-repo-path")?.value?.trim();if(!c)return alert("Enter a local repo path");try{let f=await e.api(`/worlds/${encodeURIComponent(o)}/vault/link-repo`,{method:"POST",body:JSON.stringify({repo_path:c})});if(f.error)return alert(f.error);alert(`Linked and ingested ${f.files||0} files`),await e.reloadVault(o,{force:!0}),await e.refresh(),e.afterVaultMutation(o)}catch(f){alert(f.message)}}async function Y(o){let c=e.$("#vault-search-q")?.value?.trim();if(!c)return;let f=e.$("#vault-search-results");try{let R=((await e.api(`/vault/search?${new URLSearchParams({q:c,world_id:o})}`)).hits||[]).map(G=>`[${G.metadata?.domain||"?"}] ${G.metadata?.source||""}
${(G.text||"").slice(0,200)}`).join(`

---

`)||"No hits.";f&&(f.textContent=R,f.hidden=!1)}catch(_){f&&(f.textContent=_.message,f.hidden=!1)}}async function K(o){if(confirm("Delete this sub-world?"))try{let c=await e.api(`/worlds/${encodeURIComponent(o)}`,{method:"DELETE"});e.state.worlds=c.tree,e.currentWorldId()===o&&e.setActiveWorld("root"),e.inspectorWorldId()===o&&e.selectInspectorWorld("root"),await e.refresh(),e.currentView==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.render())}catch(c){alert(c.message)}}e.renderWorldOptionsForDocs=S,e.githubRepoDocuments=k,e.findReadmeDoc=b,e.countGithubTreeFiles=a,e.renderGithubTreeNode=p,e.tagVaultDocInChat=u,e.buildVaultGraph=m,e.vaultGraphForWorld=n,e.worldGraphLegendHtml=t,e.renderWorldCreateForm=s,e.worldById=l,e.inspectorWorldId=i,e.loadWorldVault=g,e.reloadVault=D,e.reloadWorldTree=A,e.ensureVaultForWorld=v,e.patchWorldTreeNav=y,e.patchWorldPanels=L,e.onWorldContextChanged=W,e.selectInspectorWorld=N,e.renderWorldTreeNav=q,e.renderWorldInspector=z,e.renderVaultDocForm=Z,e.renderGithubReposPanel=ae,e.renderVaultRegistryBar=J,e.renderWorldVaultPanel=C,e.renderWorld=r,e.isRootWorld=d,e.createWorldFromForm=w,e.saveWorldEdit=I,e.submitVaultDoc=V,e.startVaultDocEdit=F,e.connectGithubRepo=U,e.syncGithubRepo=h,e.unlinkGithubRepo=$,e.deleteVaultDoc=T,e.vaultIngest=P,e.vaultLinkRepo=M,e.vaultSearch=Y,e.deleteWorld=K}function ke(e){function S(){let y=e.state.ui?.crmTab||localStorage.getItem("fos_crm_tab")||"contacts";return y==="outreach"?"contacts":y}function k(y){let L=e.state.worlds||e.state._worldFull?.worlds||{},W=L.root,N=L.children||[],q=[];return W&&q.push(`<option value="${e.esc(W.id||"root")}"${(y||"root")===(W.id||"root")?" selected":""}>${e.esc(W.name||"Main world")}</option>`),N.forEach(z=>{q.push(`<option value="${e.esc(z.id)}"${y===z.id?" selected":""}>${e.esc(z.name||z.id)}</option>`)}),q.join("")}function b(y={}){let L=e.crmTab();return`<nav class="crm-tabs" role="tablist" aria-label="CRM sections">${[["contacts","Contacts",y.contacts],["companies","Companies",y.companies],["pipeline","Pipeline",null]].map(([N,q,z])=>`<button type="button" role="tab" aria-selected="${L===N}" class="crm-tab${L===N?" crm-tab--active":""}" data-crm-tab="${N}">${e.esc(q)}${z!=null?`<span class="crm-tab__count">${z}</span>`:""}</button>`).join("")}</nav>`}function a(){let y=e.state._crm?.contacts||[],L=e.state._crm?.followups_due||[],W=!!e.state.ui?.crmFormOpen,N=e.state._crmCompanies?.companies||[],q=J=>e.CRM_STATUSES.map(C=>`<option value="${C}"${C===J?" selected":""}>${e.esc(C)}</option>`).join(""),z='<option value="">\u2014 None \u2014</option>'+N.map(J=>`<option value="${J.id}">${e.esc(J.name)}</option>`).join(""),Z=y.slice(0,50).map(J=>`<tr>
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
      </td></tr>`).join(""),ae=L.map(J=>`<li class="crm-followup-row">
      <span>${e.esc(J.name)} @ ${e.esc(J.company||"?")}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goto="crm">Open</button>
    </li>`).join("")||"<li class='muted'>None due</li>";return`
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Contacts</p>
            <h3 class="title-sm">People &amp; follow-ups</h3>
          </div>
          <button type="button" class="button-primary button-sm" data-toggle-ui="crmFormOpen">${W?"Hide form":"Add contact"}</button>
        </div>
        ${W?`
        <form class="human-form" id="crm-create-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Full name"></label>
            <label class="human-field"><span class="caption-uppercase">Company</span>
              <select class="text-input-on-dark" name="company_id">${z}</select></label>
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
        <p class="caption-uppercase" style="color:var(--color-muted)">Contacts (${y.length})</p>
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Role</th><th>Status</th><th>Email</th><th>Phone</th><th>WA</th><th>Follow up</th></tr></thead>
        <tbody>${Z||'<tr><td colspan="8" class="muted">No contacts yet \u2014 use Add contact above.</td></tr>'}</tbody></table></div>
        ${e.state._crmWaThread?.length?`<div class="driver-card" style="margin-top:var(--space-md)">
          <p class="caption-uppercase">WhatsApp thread</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${e.state._crmWaThread.map(J=>`<li><span class="muted">${e.esc((J.sent_at||"").slice(0,16).replace("T"," "))}</span> <strong>${e.esc(J.direction||"")}</strong>: ${e.esc((J.body||"").slice(0,200))}</li>`).join("")}</ul>
        </div>`:""}
      </section>`}function p(){if(e.state._crmCompaniesLoading)return`<section class="driver-card span-12 crm-loading-panel" aria-busy="true">
        <div class="crm-skeleton crm-skeleton--title"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
      </section>`;if(e.state._crmCompaniesError)return`<section class="driver-card span-12 crm-error-panel">
        <p class="body-md">Could not load companies \u2014 ${e.esc(e.state._crmCompaniesError)}</p>
        <button type="button" class="button-primary button-sm" data-crm-reload>Retry</button>
      </section>`;let y=e.state._crmCompanies?.companies||[],L=e.state._crmCompanies?.meta?.unlinked_contact_companies||0,W=!!e.state.ui?.crmCompanyFormOpen,N=e.state.ui?.crmCompanyDetail,q=e.currentWorldId(),z=r=>e.COMPANY_STATUSES.map(d=>`<option value="${d}"${d===r?" selected":""}>${e.esc(d)}</option>`).join(""),Z=y.map(r=>`<tr>
      <td><button type="button" class="button-tertiary-text" data-crm-company-detail="${r.id}">${e.esc(r.name)}</button></td>
      <td>${e.esc(r.sector||r.industry||"\u2014")}</td>
      <td><span class="crm-status-pill crm-status-pill--${e.esc((r.status||"prospect").replace(/\s+/g,"-"))}">${e.esc(r.status||"prospect")}</span></td>
      <td>${r.contact_count??0}</td>
      <td class="muted">${e.esc((r.last_contacted_at||"").slice(0,10))}</td>
    </tr>`).join(""),ae="";if(N){let r=y.find(w=>String(w.id)===String(N))||e.state._crmCompanyDetail?.company,d=e.state._crmCompanyDetail?.contacts||[];r&&(ae=`<aside class="crm-company-drawer driver-card">
          <div class="human-panel__head">
            <h4 class="title-sm">${e.esc(r.name)}</h4>
            <button type="button" class="button-outline-on-dark button-sm" data-crm-company-close>Close</button>
          </div>
          <dl class="settings-kv">
            <div class="settings-kv__row"><dt>Sector</dt><dd>${e.esc(r.sector||r.industry||"\u2014")}</dd></div>
            <div class="settings-kv__row"><dt>Status</dt><dd>${e.esc(r.status||"prospect")}</dd></div>
            <div class="settings-kv__row"><dt>Website</dt><dd>${r.website?`<a href="${e.esc(r.website)}" target="_blank" rel="noopener">${e.esc(r.website)}</a>`:"\u2014"}</dd></div>
          </dl>
          ${r.research_summary?`<p class="body-md" style="margin-top:var(--space-sm)">${e.esc(r.research_summary)}</p>`:""}
          ${r.notes?`<p class="muted body-sm">${e.esc(r.notes)}</p>`:""}
          <p class="caption-uppercase" style="margin-top:var(--space-md)">Linked contacts (${d.length})</p>
          <ul class="list-plain">${d.map(w=>`<li>${e.esc(w.name)} \u2014 ${e.esc(w.role||"")} ${w.email?`<span class="muted">${e.esc(w.email)}</span>`:""}</li>`).join("")||"<li class='muted'>None</li>"}</ul>
        </aside>`)}let J=L>0?`
      <div class="crm-import-banner">
        <div>
          <p class="body-md"><strong>${L}</strong> unique company name${L===1?"":"s"} on contacts not yet linked to company records.</p>
          <p class="body-sm muted">Import creates company rows and links your existing contacts automatically.</p>
        </div>
        <button type="button" class="button-primary button-sm" data-crm-import-companies>Import from contacts</button>
      </div>`:"",C=Z?"":`
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
            <button type="button" class="button-primary button-sm" data-toggle-ui="crmCompanyFormOpen">${W?"Hide form":"Add company"}</button>
          </div>
        </div>
        ${J}
        ${W?`
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
              <select class="text-input-on-dark" name="status">${z("prospect")}</select></label>
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
        <tbody>${Z}</tbody></table></div>`}
        ${ae}
      </section>`}function u(){let y=e.state._crm?.pipeline||{},L=Object.entries(y).map(([z,Z])=>`<div class="kv"><span class="k">${e.esc(z)}</span><span class="v">${Z}</span></div>`).join("")||"<p class='muted'>No pipeline data</p>",W=e.state._crmCompanies?.companies||[],N={};W.forEach(z=>{let Z=z.status||"prospect";N[Z]=(N[Z]||0)+1});let q=Object.entries(N).map(([z,Z])=>`<div class="kv"><span class="k">${e.esc(z)}</span><span class="v">${Z} companies</span></div>`).join("")||"<p class='muted'>No company pipeline data</p>";return`<section class="driver-card span-6"><p class="caption-uppercase">Contact pipeline</p><div style="margin-top:var(--space-sm)">${L}</div></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Company pipeline</p><div style="margin-top:var(--space-sm)">${q}</div></section>`}function m(){let y=e.crmTab(),L={contacts:e.state._crm?.contacts?.length||0,companies:e.state._crmCompanies?.companies?.length||0},W="";return y==="contacts"?W=e.renderCrmContactsPanel():y==="companies"?W=e.renderCrmCompaniesPanel():W=e.renderCrmPipelinePanel(),`<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <h2 class="title-md" style="text-wrap:balance">CRM</h2>
            <p class="body-sm muted">Contacts, companies, and pipeline. Batch outreach lives on the <button type="button" class="button-tertiary-text button-sm" data-goto="outreach">Outreach</button> page.</p>
          </div>
        </div>
        ${e.renderCrmTabs(L)}
      </section>
      ${W}
    </div>`}async function n(){let y=e.crmTab(),L=e.currentWorldId(),W=y==="companies"?"?include_unassigned=1":L&&L!=="root"?`?world_id=${encodeURIComponent(L)}&include_unassigned=1`:"?include_unassigned=1";e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[N,q]=await Promise.all([e.api("/crm/contacts"),e.api(`/crm/companies${W}`)]);e.state._crm=N,e.state._crmCompanies=q}catch(N){e.state._crmCompaniesError=N.message||"Could not load CRM data"}finally{e.state._crmCompaniesLoading=!1}}async function t(y){let L=new FormData(y),W=(L.get("name")||"").toString().trim();if(!W)return;let N=(L.get("company_id")||"").toString().trim();try{await e.api("/crm/contacts",{method:"POST",body:JSON.stringify({name:W,company_id:N?parseInt(N,10):null,role:(L.get("role")||"").toString().trim(),email:(L.get("email")||"").toString().trim(),status:(L.get("status")||"prospect").toString(),linkedin_url:(L.get("linkedin_url")||"").toString().trim(),phone:(L.get("phone")||"").toString().trim(),whatsapp_enabled:L.get("whatsapp_enabled")==="1",notes:(L.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmFormOpen=!1),await e.refresh(),e.render(),y.reset()}catch(q){alert(q.message)}}async function s(){let y=e.currentWorldId(),L=y&&y!=="root"?y:null;try{let W=await e.api("/crm/companies/import-from-contacts",{method:"POST",body:JSON.stringify({world_id:L})});await e.loadCrmData(),e.render();let N=`Imported ${W.created||0} companies and linked ${W.linked_contacts||0} contacts.`;e.state._toast?e.state._toast(N):alert(N)}catch(W){alert(W.message)}}async function l(y){let L=new FormData(y),W=(L.get("name")||"").toString().trim(),N=(L.get("world_id")||"").toString().trim();if(!(!W||!N))try{await e.api("/crm/companies",{method:"POST",body:JSON.stringify({name:W,world_id:N,sector:(L.get("sector")||"").toString().trim(),status:(L.get("status")||"prospect").toString(),website:(L.get("website")||"").toString().trim(),linkedin_url:(L.get("linkedin_url")||"").toString().trim(),notes:(L.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmCompanyFormOpen=!1),e.render(),y.reset()}catch(q){alert(q.message)}}async function i(y){if(y)try{let L=await e.api(`/crm/companies/${encodeURIComponent(y)}`);e.state._crmCompanyDetail=L,e.state.ui||(e.state.ui={}),e.state.ui.crmCompanyDetail=y,e.render()}catch(L){alert(L.message)}}async function g(y,L){if(!(!y||!L))try{await e.api(`/crm/contacts/${encodeURIComponent(y)}`,{method:"PATCH",body:JSON.stringify({status:L})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(W){alert(W.message)}}async function D(y,L){if(y)try{await e.api(`/crm/contacts/${encodeURIComponent(y)}`,{method:"PATCH",body:JSON.stringify({whatsapp_enabled:!!L})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(W){alert(W.message)}}async function A(y){if(y)try{let L=await e.api(`/whatsapp/messages?contact_id=${encodeURIComponent(y)}`);e.state._crmWaThread=L.messages||[],e.render()}catch(L){alert(L.message)}}async function v(y,L){let W=parseInt(L,10)||7;await e.api(`/crm/contacts/${y}/followup`,{method:"POST",body:JSON.stringify({days:W}),timeoutMs:15e3}),e.state._crm=await e.api("/crm/contacts"),e.currentView==="crm"&&e.render()}e.crmTab=S,e.renderWorldOptionsForCrm=k,e.renderCrmTabs=b,e.renderCrmContactsPanel=a,e.renderCrmCompaniesPanel=p,e.renderCrmPipelinePanel=u,e.renderCrm=m,e.loadCrmData=n,e.submitCrmContact=t,e.importCrmCompaniesFromContacts=s,e.submitCrmCompany=l,e.openCrmCompanyDetail=i,e.updateCrmStatus=g,e.updateCrmWhatsapp=D,e.loadCrmWaThread=A,e.scheduleCrmFollowup=v}function Ce(e){function S(){return e.state.ui?.crmOutreachWorld||e.currentWorldId()}function k(){let h=e.state._crmCampaignReview,$=h?.campaign;return $?.status==="done"||h?.done&&!h?.pending_count?"complete":h?.campaign&&["review"].includes($.status)&&h.pending_count>0?"review":h?.campaign&&["review"].includes($.status)&&!h.pending_count?"complete":e.state._crmOutreachJob?.active||["researching","drafting","created"].includes($?.status||e.state._crmOutreachJob?.status)||e.state.ui?.crmCampaignId&&$&&!["review","done","failed"].includes($.status)?"running":"setup"}function b(){return e.state.ui?.crmOutreachBatch||5}function a(){return e.state.ui?.crmOutreachSelected||[]}function p(){return e.state.ui||(e.state.ui={}),Array.isArray(e.state.ui.crmOutreachDraft)||(e.state.ui.crmOutreachDraft=[...a()]),e.state.ui.crmOutreachDraft}function u(){let h=[...p()].sort((T,P)=>T-P).join(","),$=[...a()].sort((T,P)=>T-P).join(",");return h!==$}function m(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachDraft=[],e.state.ui.crmOutreachSelected=[]}function n(){e.state.ui||(e.state.ui={}),Array.isArray(e.state.ui.crmOutreachDraft)||(e.state.ui.crmOutreachDraft=[...a()])}function t(){let h=b(),$=new Set(p()),T=a().length,P=u(),M=document.getElementById("outreach-company-picker");if(!M)return;M.querySelectorAll("[data-crm-company-toggle]").forEach(G=>{let O=parseInt(G.dataset.crmCompanyToggle,10),B=$.has(O);G.checked=B,G.disabled=!B&&$.size>=h,G.closest(".outreach-company-row")?.classList.toggle("is-selected",B)});let Y=M.querySelector(".outreach-select-meter__fill");Y&&(Y.style.width=`${Math.min(100,$.size/h*100)}%`);let K=document.getElementById("outreach-draft-count");K&&(K.textContent=String($.size));let o=document.getElementById("outreach-saved-count");o&&(o.textContent=String(T));let c=document.getElementById("outreach-selection-dirty");c&&(c.hidden=!P);let f=document.getElementById("outreach-save-companies");f&&(f.disabled=!P||$.size===0,f.classList.toggle("is-pulse",P&&$.size>0));let _=document.getElementById("outreach-start-btn");if(_){let G=S(),O=T>0&&G!=="root"&&!P;_.disabled=!O,P?_.title="Save your company selection before starting":T?_.title="":_.title="Select and save at least one company"}let R=document.getElementById("outreach-batch-hint");R&&(R.textContent=$.size>=h?`Batch limit reached (${h})`:`Up to ${h} companies per campaign`)}function s(h){let $=parseInt(h.dataset.crmCompanyToggle,10);if(!$)return;e.state.ui||(e.state.ui={});let T=b(),P=new Set(p());if(h.checked){if(P.size>=T){h.checked=!1;return}P.add($)}else P.delete($);e.state.ui.crmOutreachDraft=[...P],t()}function l(){e.state.ui||(e.state.ui={});let h=p();if(!h.length)return;e.state.ui.crmOutreachSelected=[...h];let $=S();if($)try{localStorage.setItem(`fos_outreach_sel_${$}`,JSON.stringify(h))}catch{}t();let T=document.getElementById("outreach-save-companies");T&&(T.classList.add("is-saved-flash"),setTimeout(()=>T?.classList.remove("is-saved-flash"),600))}function i(h){e.state.ui||(e.state.ui={});let $=parseInt(h,10)||5;e.state.ui.crmOutreachBatch=$;let T=p();T.length>$&&(e.state.ui.crmOutreachDraft=T.slice(0,$)),t()}function g(h){let $=(h||"").trim().toLowerCase();document.querySelectorAll("#outreach-company-picker .outreach-company-row").forEach(T=>{let P=(T.dataset.search||"").toLowerCase();T.hidden=!!($&&!P.includes($))})}function D(){let h=S();return(e.state._crmCompanies?.companies||[]).filter($=>h&&h!=="root"&&$.world_id&&$.world_id!==h?!1:$.status==="prospect"||!$.status)}function A(h){if(h.channel==="email"){if(!(h.subject||"").trim())return"Subject required";if(!(h.body||"").trim())return"Body required";if(!(h.email||"").trim())return"Contact has no email"}if(h.channel==="whatsapp"){if(!(h.body||"").trim())return"Message required";if((h.body||"").length>300)return"Max 300 characters";if(!h.whatsapp_enabled)return"WhatsApp not allowlisted";if(!(h.phone||"").trim())return"No phone on contact"}return""}function v(h){let $=[["setup","1. Setup"],["running","2. Research & draft"],["review","3. Review & send"],["complete","4. Done"]],P={setup:0,running:1,review:2,complete:3}[h]??0;return`<nav class="crm-outreach-steps" aria-label="Outreach progress">${$.map(([M,Y],K)=>`<span class="${K<P?"crm-outreach-step crm-outreach-step--done":K===P?"crm-outreach-step crm-outreach-step--active":"crm-outreach-step"}">${e.esc(Y)}</span>`).join("")}</nav>`}function y(){let h=e.state._crmOutreachJob||{},$=e.state._crmCampaignDetail?.campaign||e.state._crmCampaignReview?.campaign||{},T=h.phase||$.status||"Starting\u2026",M=(e.state._crmCampaignReview?.companies||e.state._crmCampaignDetail?.review?.companies||[]).length||$.batch_size||"?";return`<section class="driver-card span-12 crm-outreach-running">
      <p class="section-eyebrow">Outreach in progress</p>
      <h3 class="title-sm">${e.esc($.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("running")}
      <div class="crm-outreach-progress-strip">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:40%"></div></div>
        <p class="body-md"><strong>${e.esc(T)}</strong></p>
        <p class="muted body-sm">Researching companies via knowledge tree + web, then drafting messages. This runs in the background \u2014 you can leave this page.</p>
        <p class="muted body-sm">Batch: ${M} companies \xB7 World: <span data-active-world-label>${e.esc(e.activeWorldLabel())}</span></p>
      </div>
      <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-refresh>Refresh status</button>
    </section>`}function L(h){let $=h.progress||{},T=$.by_status||{};return`<section class="driver-card span-12">
      <p class="section-eyebrow">Campaign complete</p>
      <h3 class="title-sm">${e.esc(h.campaign?.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("complete")}
      <div class="crm-outreach-summary">
        <div class="kv"><span class="k">Sent</span><span class="v">${T.sent||0}</span></div>
        <div class="kv"><span class="k">Skipped</span><span class="v">${T.skipped||0}</span></div>
        <div class="kv"><span class="k">Failed</span><span class="v">${T.failed||0}</span></div>
        <div class="kv"><span class="k">Companies</span><span class="v">${$.companies_complete||0}/${$.companies_total||0}</span></div>
      </div>
      <div class="human-form__actions" style="margin-top:var(--space-md)">
        <button type="button" class="button-primary button-sm" data-crm-outreach-back>Start new campaign</button>
      </div>
    </section>`}function W(h){let $=h.campaign,T=h.strategy||{},P=h.current_company,M=h.current_research||{},Y=h.current_drafts||[],K=h.progress||{},o=Y.filter(O=>O.channel==="email"),c=Y.filter(O=>O.channel==="whatsapp"),f=P?.company_name||P?.name||"Company",_=K.company_index||1,R=K.companies_total||1,G=O=>{let B=e.draftApproveDisabledReason(O),Q=(O.body||"").length;return`<div class="crm-draft-card driver-card" data-draft-id="${O.id}">
        <div class="crm-draft-card__head">
          <p class="caption-uppercase">${O.channel==="email"?"Gmail":"WhatsApp"} \u2192 ${e.esc(O.contact_name||"Contact")}</p>
          ${O.channel==="email"?`<span class="muted body-sm">${e.esc(O.email||"")}</span>`:`<span class="muted body-sm">${e.esc(O.phone||"")}</span>`}
        </div>
        ${O.personalization_notes?`<p class="body-sm muted">${e.esc(O.personalization_notes)}</p>`:""}
        ${O.channel==="email"?`<label class="human-field"><span class="caption-uppercase">Subject</span>
          <input class="text-input-on-dark crm-draft-subject" data-draft-id="${O.id}" value="${e.esc(O.subject||"")}"></label>`:""}
        <label class="human-field"><span class="caption-uppercase">Message</span>
          <textarea class="text-input-on-dark crm-draft-body" data-draft-id="${O.id}" data-channel="${e.esc(O.channel)}" rows="${O.channel==="whatsapp"?3:6}">${e.esc(O.body||"")}</textarea>
          ${O.channel==="whatsapp"?`<span class="caption muted crm-wa-count" data-draft-id="${O.id}">${Q}/300</span>`:""}
        </label>
        <div class="human-form__actions">
          <button type="button" class="button-primary button-sm" data-crm-draft-approve="${O.id}" ${B?'disabled title="'+e.esc(B)+'"':""}>Approve &amp; Send</button>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-draft-skip="${O.id}">Skip message</button>
        </div>
        ${O.error_message?`<p class="crm-draft-error">${e.esc(O.error_message)}</p>`:""}
        ${B?`<p class="muted body-sm">${e.esc(B)}</p>`:""}
      </div>`};return`<section class="driver-card span-12">
      <div class="human-panel__head">
        <div>
          <p class="section-eyebrow">Review &amp; send</p>
          <h3 class="title-sm">${e.esc($.name||"Campaign")}</h3>
          <p class="muted body-sm">Company ${_} of ${R} \xB7 ${h.pending_count||0} message(s) left \u2014 approve one at a time</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-back>Exit review</button>
      </div>
      ${e.renderOutreachSteps("review")}
      <div class="crm-outreach-progress-meta">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:${Math.round((K.companies_complete||0)/Math.max(R,1)*100)}%"></div></div>
        <div class="crm-outreach-stats">
          <span class="badge-pill">Sent ${(K.by_status||{}).sent||0}</span>
          <span class="badge-pill">Skipped ${(K.by_status||{}).skipped||0}</span>
          <span class="badge-pill">Pending ${h.pending_count||0}</span>
        </div>
      </div>
      <details class="crm-strategy-details">
        <summary class="caption-uppercase">Cohort strategy</summary>
        <pre class="body-sm muted" style="white-space:pre-wrap">${e.esc(JSON.stringify(T,null,2))}</pre>
      </details>
      ${P?`<div class="crm-company-review driver-card">
        <div class="human-panel__head">
          <h4 class="title-sm">${e.esc(f)}</h4>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-skip-company="${P.company_id}">Skip company</button>
        </div>
        <p class="body-sm muted">${e.esc(M.sector||P.sector||"")}</p>
        ${M.crm_research_summary?`<p class="body-sm">${e.esc(String(M.crm_research_summary).slice(0,400))}</p>`:""}
        ${(M.web_hits||[]).length?`<p class="caption-uppercase">Web signals</p><ul class="list-plain">${M.web_hits.slice(0,3).map(O=>`<li class="body-sm">${e.esc(O.snippet||O.title||"")}${O.url?` <a href="${e.esc(O.url)}" target="_blank" rel="noopener">link</a>`:""}</li>`).join("")}</ul>`:""}
        ${(M.vault_files_used||[]).length?`<p class="caption-uppercase">Vault files used</p><ul class="list-plain">${M.vault_files_used.map(O=>`<li class="body-sm">${e.esc(O.title||"doc #"+O.doc_id)}</li>`).join("")}</ul>`:""}
      </div>`:""}
      ${o.length?'<p class="caption-uppercase">Email drafts</p>':""}
      ${o.map(G).join("")}
      ${c.length?'<p class="caption-uppercase" style="margin-top:var(--space-md)">WhatsApp drafts</p>':""}
      ${c.map(G).join("")}
      ${!Y.length&&P?'<p class="muted">No drafts for this company \u2014 contacts may lack email or WhatsApp allowlist.</p>':""}
    </section>`}function N(h){e.state.ui||(e.state.ui={});let $=[];if(h)try{let T=localStorage.getItem(`fos_outreach_sel_${h}`),P=T?JSON.parse(T):[];$=Array.isArray(P)?P.filter(M=>Number.isFinite(M)):[]}catch{}e.state.ui.crmOutreachSelected=$,e.state.ui.crmOutreachDraft=[...$]}function q(){n();let h=e.state._crmCampaigns?.campaigns||[],$=S(),T=D(),P=b(),M=new Set(p()),Y=a().length,K=u(),c=((e.state.worlds||e.state._worldFull?.worlds||{}).children||[]).length>0,f=e.state._crmCompaniesLoading,_=e.state._crmCompaniesError,R=T.map(E=>{let X=M.has(E.id),j=E.contact_count||0,te=`${E.name||""} ${E.sector||""}`.trim();return`<label class="outreach-company-row human-field--checkbox${X?" is-selected":""}" data-search="${e.esc(te)}">
        <input type="checkbox" data-crm-company-toggle="${E.id}" ${X?"checked":""} ${M.size>=P&&!X?"disabled":""}>
        <span class="outreach-company-row__main">
          <span class="outreach-company-row__name">${e.esc(E.name)}</span>
          <span class="outreach-company-row__meta muted">${e.esc(E.sector||"\u2014")} \xB7 ${j} contact${j===1?"":"s"}</span>
        </span>
      </label>`}).join(""),G=[5,10,15,20].map(E=>`<option value="${E}"${P===E?" selected":""}>${E}</option>`).join(""),O=h.slice(0,12).map(E=>`<tr>
        <td><button type="button" class="${E.status==="review"?"button-primary":"button-tertiary-text"} button-sm" data-crm-campaign="${E.id}">${e.esc(E.name)}</button></td>
        <td><span class="badge-pill badge-pill--${e.esc(E.status)}">${e.esc(E.status)}</span></td>
        <td class="muted">${e.esc((E.created_at||"").slice(0,10))}</td>
        <td>${E.status==="review"?`<button type="button" class="button-outline-on-dark button-sm" data-crm-campaign="${E.id}">Continue review</button>`:""}</td>
      </tr>`).join("")||'<tr><td colspan="4" class="muted">No campaigns yet</td></tr>',B=T.length?`<div id="outreach-company-picker" class="outreach-company-picker">
          <div class="outreach-picker-toolbar">
            <div class="outreach-picker-toolbar__head">
              <p class="caption-uppercase">Companies</p>
              <div class="outreach-picker-toolbar__counts">
                <span class="outreach-count-pill" title="Currently selected (not yet saved)">
                  <strong id="outreach-draft-count">${M.size}</strong><span class="muted"> / ${P}</span>
                </span>
                <span class="outreach-count-pill outreach-count-pill--saved" title="Saved for this campaign">
                  <strong id="outreach-saved-count">${Y}</strong> saved
                </span>
                <span id="outreach-selection-dirty" class="outreach-dirty-badge"${K?"":" hidden"}>Unsaved</span>
              </div>
            </div>
            <div class="outreach-select-meter" role="progressbar" aria-valuenow="${M.size}" aria-valuemin="0" aria-valuemax="${P}" aria-label="Selection progress">
              <div class="outreach-select-meter__fill" style="width:${Math.min(100,M.size/P*100)}%"></div>
            </div>
            <p class="body-sm muted" id="outreach-batch-hint">${M.size>=P?`Batch limit reached (${P})`:`Pick up to ${P}, then save`}</p>
            <div class="outreach-picker-toolbar__actions">
              <input type="search" id="outreach-company-search" class="text-input-on-dark outreach-company-search" placeholder="Filter companies\u2026" autocomplete="off">
              <button type="button" id="outreach-save-companies" class="button-outline-on-dark button-sm" data-outreach-save-companies ${K&&M.size?"":"disabled"}>Save selection</button>
            </div>
          </div>
          <div class="outreach-company-list">${R}</div>
        </div>`:`<div class="crm-outreach-empty">
          <p class="body-md">No prospect companies for this world.</p>
          <p class="body-sm muted">Import from CRM contacts or add companies manually, then return here to build a batch.</p>
          <div class="human-form__actions">
            <button type="button" class="button-primary button-sm" data-outreach-open-crm-companies>Open companies in CRM</button>
          </div>
        </div>`,Q=Y>0&&$!=="root"&&!K;return`<section class="driver-card span-12 human-panel outreach-setup">
      <div class="human-panel__head">
        <div>
          <h3 class="title-sm">Batch outreach</h3>
          <p class="body-sm muted">Pick companies, save your batch, then start \u2014 research and drafts run in the background.</p>
        </div>
      </div>
      ${e.renderOutreachSteps("setup")}
      ${c?"":'<p class="crm-outreach-warn">Create a sub-world under <strong>World</strong> first \u2014 outreach needs a venture context for vault research.</p>'}
      ${_?`<p class="crm-draft-error">${e.esc(_)}</p>`:""}
      <form class="human-form outreach-setup-form" id="crm-outreach-form">
        <div class="outreach-setup-grid">
          <label class="human-field"><span class="caption-uppercase">World</span>
            <select class="text-input-on-dark" name="world_id" id="crm-outreach-world">${e.renderWorldOptionsForCrm($)}</select></label>
          <label class="human-field"><span class="caption-uppercase">Batch size</span>
            <select class="text-input-on-dark" name="batch_size" id="crm-outreach-batch">${G}</select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Outreach brief</span>
          <textarea class="text-input-on-dark" name="brief" rows="3" placeholder="e.g. Indian manufacturing SMBs \u2014 energy cost savings, 15-min discovery call, direct tone"></textarea></label>
        ${f?'<p class="muted body-sm">Loading companies\u2026</p>':B}
        <div class="human-form__actions outreach-setup-actions">
          <button type="submit" id="outreach-start-btn" class="button-primary" ${Q?"":"disabled"}${K?' title="Save your company selection before starting"':Y?"":' title="Select and save at least one company"'}>
            Start outreach${Y?` (${Y} companies)`:""}
          </button>
        </div>
      </form>
      <section class="outreach-history">
        <p class="caption-uppercase">Recent campaigns</p>
        <div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${O}</tbody></table></div>
      </section>
    </section>`}function z(){let h=e.outreachStep(),$=e.state._crmCampaignReview;return h==="running"?e.renderOutreachRunningPanel():h==="complete"&&$?.campaign?e.renderOutreachCompletePanel($):h==="review"&&$?.campaign?e.renderOutreachReviewPanel($):e.renderOutreachSetupPanel()}function Z(){return`<div class="dashboard-grid">
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
    </div>`}async function ae(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld||(e.state.ui.crmOutreachWorld=e.currentWorldId());let h=e.outreachWorldId(),$=h&&h!=="root"?`?world_id=${encodeURIComponent(h)}&include_unassigned=1`:"?include_unassigned=1",T=h&&h!=="root"?`?world_id=${encodeURIComponent(h)}`:"",P=e.routeParams?.campaignId||e.state.ui?.crmCampaignId;e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[M,Y]=await Promise.all([e.api(`/crm/companies${$}`),e.api(`/crm/outreach/campaigns${T}`).catch(()=>({campaigns:[]}))]);if(e.state._crmCompanies=M,e.state._crmCampaigns=Y,P||Array.isArray(e.state.ui.crmOutreachDraft)||(a().length?e.state.ui.crmOutreachDraft=[...a()]:N(h)),P){e.state.ui.crmCampaignId=P;let[K,o]=await Promise.all([e.api(`/crm/outreach/campaigns/${P}`).catch(()=>null),e.api(`/crm/outreach/campaigns/${P}/review`).catch(()=>null)]);e.state._crmCampaignDetail=K,e.state._crmCampaignReview=o?.campaign?o:K?.review;let c=e.state._crmCampaignReview?.campaign||K?.campaign;c&&["researching","drafting","created"].includes(c.status)?(e.state._crmOutreachJob={active:!0,phase:c.status,status:c.status},e.state._crmOutreachPollId||e.pollCrmOutreachJob(P)):c?.status==="review"&&(e.state._crmOutreachJob={phase:"Ready for review",active:!1})}}catch(M){e.state._crmCompaniesError=M.message||"Could not load outreach data"}finally{e.state._crmCompaniesLoading=!1}}async function J(h){let $=new FormData(h),T=($.get("world_id")||"").toString().trim(),P=parseInt($.get("batch_size")||"5",10)||5,M=($.get("brief")||"").toString().trim(),Y=a();if(u())return alert("Save your company selection before starting.");if(!T||T==="root")return alert("Select a sub-world for outreach (not Main world).");if(!Y.length)return alert("Select and save at least one company.");if(!M)return alert("Add a brief so the agent knows what kind of message to write.");try{let K=await e.api("/crm/outreach/campaigns",{method:"POST",body:JSON.stringify({world_id:T,batch_size:P,brief:M,company_ids:Y})});await e.api(`/crm/outreach/campaigns/${K.campaign_id}/start`,{method:"POST"}),e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=[],e.state.ui.crmOutreachDraft=[];try{localStorage.removeItem(`fos_outreach_sel_${T}`)}catch{}e.goView("outreach",{params:{campaignId:K.campaign_id}}),e.pollCrmOutreachJob(K.campaign_id)}catch(K){alert(K.message)}}async function C(h,$=!1){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId);let T=async()=>{try{let P=await e.api(`/crm/outreach/campaigns/${h}`),M=P.campaign||{},Y=P.review||{},K=P.job||{};if(e.state._crmCampaignDetail=P,M.status==="review"||M.status==="done"||M.status==="failed"){e.state._crmOutreachJob={active:!1,phase:M.status==="review"?"Ready for review":M.status},e.state._crmCampaignReview=Y.campaign?Y:await e.api(`/crm/outreach/campaigns/${h}/review`),e.state._crmOutreachPollId=null,e.currentView==="outreach"&&e.render();return}e.state._crmOutreachJob={active:!0,phase:K.phase||M.status||"running\u2026",status:M.status},e.currentView==="outreach"&&e.render(),$||(e.state._crmOutreachPollId=setTimeout(T,2500))}catch{$||(e.state._crmOutreachPollId=setTimeout(T,4e3))}};$?await T():e.state._crmOutreachPollId=setTimeout(T,500)}async function r(h){h&&e.goView("outreach",{params:{campaignId:parseInt(h,10)}})}function d(){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null,e.state.ui&&(e.state.ui.crmCampaignId=null),e.state._crmCampaignReview=null,e.state._crmCampaignDetail=null,e.state._crmOutreachJob=null,e.goView("outreach",{params:{}})}function w(h){s(h)}async function I(h){let $=e.state.ui?.crmCampaignId;if(!(!$||!h)&&confirm("Skip all pending messages for this company?"))try{await e.api(`/crm/outreach/campaigns/${$}/companies/${h}/skip`,{method:"POST"}),e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${$}/review`),e.render()}catch(T){alert(T.message)}}async function V(h){let $=document.querySelector(`.crm-draft-subject[data-draft-id="${h}"]`),T=document.querySelector(`.crm-draft-body[data-draft-id="${h}"]`),P={};$&&(P.subject=$.value),T&&(P.body=T.value),Object.keys(P).length&&await e.api(`/crm/outreach/drafts/${h}`,{method:"PATCH",body:JSON.stringify(P)})}async function F(h){if(h)try{await e.saveCrmDraftEdits(h);let $=await e.api(`/crm/outreach/drafts/${h}/approve-send`,{method:"POST"});if($.error)return alert($.error);let T=e.state.ui?.crmCampaignId;T&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${T}/review`)),e.render()}catch($){alert($.message)}}async function U(h){if(h)try{await e.api(`/crm/outreach/drafts/${h}/skip`,{method:"POST"});let $=e.state.ui?.crmCampaignId;$&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${$}/review`)),e.render()}catch($){alert($.message)}}e.outreachWorldId=S,e.outreachStep=k,e.draftApproveDisabledReason=A,e.renderOutreachSteps=v,e.renderOutreachRunningPanel=y,e.renderOutreachCompletePanel=L,e.renderOutreachReviewPanel=W,e.renderOutreachSetupPanel=q,e.renderOutreachBody=z,e.renderOutreach=Z,e.loadOutreachData=ae,e.submitCrmOutreach=J,e.pollCrmOutreachJob=C,e.openCrmCampaignReview=r,e.closeCrmCampaignReview=d,e.toggleOutreachDraftCompany=s,e.saveOutreachCompanySelection=l,e.setOutreachBatchSize=i,e.filterOutreachCompanyList=g,e.syncOutreachCompanyPickerUi=t,e.restoreOutreachSelectionForWorld=N,e.resetOutreachCompanySelection=m,e.toggleCrmOutreachCompany=w,e.skipCrmCompany=I,e.saveCrmDraftEdits=V,e.approveCrmDraft=F,e.skipCrmDraft=U}function Ie(e){function S(){let u=e.state._goals||{},m=!!e.state.ui?.goalsFormOpen,n=!!e.state.ui?.reminderFormOpen,t=(u.active||[]).map(g=>`<li class="goal-row">
      <span><strong>${e.esc(g.title)}</strong>${g.detail?" \u2014 "+e.esc(g.detail):""}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goal-done="${g.id}">Done</button>
    </li>`).join("")||"<li class='muted'>No active goals \u2014 add one below.</li>",s=(e.state.tasks||[]).map(g=>`<li>${e.esc(g.title)} <span class="muted">P${g.priority||3}</span></li>`).join("")||"<li class='muted'>No open tasks</li>",l=(u.reminders||[]).map(g=>`<li class="reminder-row">
      <span>${e.esc(g.text)} <span class="muted">${e.esc((g.due_at||"").slice(0,16).replace("T"," "))}</span></span>
      <span class="reminder-row__actions">
        <button type="button" class="button-outline-on-dark button-sm" data-reminder-done="${g.id}">Done</button>
        <button type="button" class="button-tertiary-text button-sm" data-reminder-cancel="${g.id}">Cancel</button>
      </span>
    </li>`).join("")||"<li class='muted'>No reminders</li>",i=(u.plans||[]).map(g=>`<li>${e.esc(g.goal)}</li>`).join("")||"<li class='muted'>No open plans</li>";return`<div class="dashboard-grid">
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Goals</p>
            <h3 class="title-sm">Outcomes you own</h3>
            <p class="body-md muted">Track goals and reminders directly \u2014 no agent required.</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-primary button-sm" data-toggle-ui="goalsFormOpen">${m?"Hide goal form":"New goal"}</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="reminderFormOpen">${n?"Hide reminder":"Reminder"}</button>
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
        ${n?`
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
      <section class="driver-card span-6"><p class="caption-uppercase">Open tasks</p><ul class="list-plain" style="margin-top:var(--space-sm)">${s}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Reminders</p><ul class="list-plain" style="margin-top:var(--space-sm)">${l}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Plans &amp; projects</p><ul class="list-plain" style="margin-top:var(--space-sm)">${i}</ul></section>
    </div>`}async function k(u){let m=new FormData(u),n=(m.get("title")||"").toString().trim();if(n)try{await e.api("/goals",{method:"POST",body:JSON.stringify({title:n,detail:(m.get("detail")||"").toString().trim(),priority:parseInt(m.get("priority")||"3",10)||3})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.goalsFormOpen=!1),await e.refresh(),e.render(),u.reset()}catch(t){alert(t.message)}}async function b(u){if(u)try{await e.api(`/goals/${encodeURIComponent(u)}`,{method:"PATCH",body:JSON.stringify({status:"done"})}),e.state._goals=await e.api("/goals"),await e.refresh(),e.render()}catch(m){alert(m.message)}}async function a(u){let m=new FormData(u),n=(m.get("text")||"").toString().trim(),t=(m.get("due_at")||"").toString().trim();if(!n||!t)return;let s=t.length===16?`${t}:00`:t;try{await e.api("/reminders",{method:"POST",body:JSON.stringify({text:n,due_at:s})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.reminderFormOpen=!1),e.render(),u.reset()}catch(l){alert(l.message)}}async function p(u,m){if(await e.api(`/reminders/${u}`,{method:"PATCH",body:JSON.stringify({status:m}),timeoutMs:15e3}),e.state._goals=await e.api("/goals"),e.currentView==="goals"&&e.render(),e.currentView==="dashboard"){let n=e.currentWorldId(),t=n&&n!=="root"?`?world_id=${encodeURIComponent(n)}`:"";e.state._nudges=(await e.api(`/nudges${t}`).catch(()=>({nudges:[]}))).nudges||[],e.render()}}e.renderGoals=S,e.submitGoal=k,e.markGoalDone=b,e.submitReminder=a,e.updateReminderStatus=p}function Ae(e){function S(){let b=e.state._memoryResults||[],a=e.state._memoryFull||{},p=a.collections||[],u=a.knowledge_graph||{},m=b.map(t=>`<div class="memory-hit">
      <span class="badge-pill">${e.esc(t.collection)}</span>
      <p class="body-md" style="margin-top:var(--space-xxs);max-width:72ch">${e.esc(t.text)}</p></div>`).join(""),n=p.map(t=>`
      <div class="memory-collection">
        <h4>${e.esc(t.name)} <span class="muted">(${t.count} vectors)</span></h4>
        ${(t.samples||[]).map(s=>`<p class="memory-sample">${e.esc(s.text)}</p>`).join("")||"<p class='muted'>Empty collection</p>"}
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
        <p class="body-md" style="margin-bottom:var(--space-sm)">Knowledge graph (${(u.entities||[]).length} entities, ${(u.relations||[]).length} relations) plus recent vector memory chunks.</p>
        <div id="graph-memory" class="graph-canvas"></div>
        <div class="graph-detail" id="graph-memory-detail">Click a node to inspect</div>
      </div>
      <div id="memory-tab-collections" ${e.memoryGraphTab!=="collections"?"hidden":""}>${n||"<p class='body-md'>No vector memory yet.</p>"}</div>
      <div id="memory-tab-search" ${e.memoryGraphTab!=="search"?"hidden":""}>
        <div id="memory-results">${m||'<p class="body-md">Search to find relevant memories.</p>'}</div>
      </div>`}async function k(){let b=e.$("#memory-q")?.value?.trim();if(e.state._memoryQ=b,!b)return;let a=await e.api("/memory/search?q="+encodeURIComponent(b));e.state._memoryResults=a.results,e.render()}e.renderMemory=S,e.searchMemory=k}function Le(e){function S(a){let p=a.content||"";return a.role==="agent"||a.role==="assistant"?`<div class="msg-md history-msg__body">${window.FOSMarkdown?.render?.(p)||e.esc(p)}</div>`:`<p class="body-md history-msg__body">${e.esc(p)}</p>`}function k(){let p=(e.state._history||{}).sessions||[],u=e.state._artifacts||[],m=e.state._historySession,n=e.historyTab,t=p.length?p.map(i=>`
      <button type="button" class="history-session${m?.id===i.id?" is-active":""}" data-history-session="${e.esc(i.id)}">
        <span class="history-session__title">${e.esc(i.title||"Conversation")}</span>
        <span class="history-session__meta muted">${e.esc(i.specialist||"supervisor")} \xB7 ${i.message_count||0} msgs \xB7 ${e.fmtHistoryTime(i.updated_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No conversations yet. Ask the agent something to start a session.</p>",s="<p class='body-md muted'>Select a conversation to view messages, runs, and linked documents.</p>";if(m?.messages?.length){let i=m.messages.map(A=>`
        <div class="history-msg history-msg--${e.esc(A.role)}">
          <span class="caption-uppercase">${e.esc(A.role)}</span>
          ${e.renderHistoryMessageContent(A)}
          <span class="muted" style="font-size:11px">${e.fmtHistoryTime(A.created_at)}</span>
        </div>`).join(""),g=(m.runs||[]).map(A=>`
        <article class="history-run">
          <div class="history-run__head">
            <span class="mono">${e.esc(A.specialist||A.actor||"agent")}</span>
            <span class="muted">${A.duration_s||0}s</span>
          </div>
          ${e.renderLiveFlow((A.tools||[]).map(v=>({name:v.name,decision:v.decision,t:v.t})),"No tools")}
          ${A.assistant_reply?`<div class="history-run__reply msg-md">${window.FOSMarkdown?.render?.(A.assistant_reply)||e.esc(A.assistant_reply)}</div>`:""}
        </article>`).join("")||"",D=(m.artifacts||[]).map(A=>`
        <button type="button" class="history-doc-btn" data-open-document="${A.id}">
          <span class="badge-pill">${e.esc(A.kind)}</span>
          <span>${e.esc(A.title)}</span>
        </button>`).join("")||"<p class='muted'>No documents in this session.</p>";s=`
        <div class="history-detail__actions">
          <button type="button" class="button-primary button-sm" data-open-chat-session="${e.esc(m.id)}">Open in chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New conversation</button>
        </div>
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Messages</p>
        <div class="history-messages">${i}</div>
        ${g?`<p class="caption-uppercase" style="margin-top:var(--space-md)">Runs</p>${g}`:""}
        <p class="caption-uppercase" style="margin-top:var(--space-md)">Documents</p>
        <div class="history-artifacts">${D}</div>`}let l=u.length?u.map(i=>`
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
        <button type="button" class="graph-tab ${n==="conversations"?"is-active":""}" data-history-tab="conversations">Conversations</button>
        <button type="button" class="graph-tab ${n==="documents"?"is-active":""}" data-history-tab="documents">Documents</button>
      </div>
      ${n==="conversations"?`<div class="history-layout">
        <section class="driver-card history-sessions">${t}</section>
        <section class="driver-card history-detail">${s}</section>
      </div>`:`<section class="driver-card history-documents-grid">${l}</section>`}`}async function b(a){e.state._historySelectedId=a;try{e.state._historySession=await e.api(`/history/sessions/${a}`)}catch{e.state._historySession=null}e.render()}e.renderHistoryMessageContent=S,e.renderHistory=k,e.loadHistorySession=b}function Oe(e){function S(){let b=e.state.approvals||[];return b.length?`<section class="driver-card">${b.map(a=>`
      <div class="approval-block">
        <div class="approval-meta caption-uppercase"><span class="mono">#${a.id}</span> \xB7 ${e.esc(a.tool_name)}</div>
        <div class="approval-summary body-md">${e.esc(a.summary)}</div>
        <div class="approval-actions">
          <button type="button" class="button-primary button-sm" data-approve="${a.id}">Approve</button>
          <button type="button" class="button-outline-on-dark button-sm" data-reject="${a.id}">Reject</button>
        </div>
      </div>`).join("")}</section>`:'<section class="driver-card empty-state"><p class="title-sm">No pending approvals</p></section>'}async function k(b,a){try{let p=await e.api(`/approvals/${b}/${a?"approve":"reject"}`,{method:"POST"});e.chatHistory.push({role:"system",text:p.result}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.refresh(),e.currentView==="approvals"&&e.render()}catch(p){alert(p.message)}}e.renderApprovals=S,e.decideApproval=k}function Re(e){function S(){let k=e.state._tools||{},b=(k.tools||[]).map(a=>`<div class="tool-row">
      <div class="name">${e.esc(a.name)}${a.requires_approval?' <span class="badge-pill">approval</span>':""}</div>
      <div class="cat">${e.esc(a.category)}</div>
      <div class="desc">${e.esc(a.description)}</div></div>`).join("");return`<p class="body-md" style="margin-bottom:var(--space-xs);max-width:60ch">${k.total||0} tools \xB7 ${Object.keys(k.by_category||{}).length} categories. Tool-RAG retrieves the most relevant set per message.</p>
    <div class="tool-list">${b}</div>`}e.renderTools=S}function De(e){function S(){let k=e.state._activity?.traces_full||[],b=e.state._activity?.actions||e.state.actions||[],a=k.length?k.map(u=>`
      <article class="trace-card">
        <div class="trace-card-head">
          <span class="mono">${e.esc(u.actor)}</span>
          <span class="muted">${u.duration_s}s</span>
        </div>
        <p class="message">${e.esc(u.message)}</p>
        ${e.renderLiveFlow(u.events,"No tools in this turn")}
        ${u.final?`<p class="world-meta" style="margin-top:var(--space-xs)">\u2192 ${e.esc(u.final)}</p>`:""}
      </article>`).join(""):"<p class='body-md muted'>No agent turns logged today. Send a message in Chat to see the decision flow here.</p>",p=b.slice(0,20).map(u=>`<div class="activity-row">
      <div class="mono">${e.esc(u.tool_name)}</div>
      <div class="meta">${e.esc(u.actor)} \xB7 ${e.esc((u.created_at||"").slice(0,16))}</div></div>`).join("")||"<p class='muted'>No actions logged.</p>";return`<div class="dashboard-grid">
      <section class="driver-card span-8"><p class="caption-uppercase">Decision flow</p><div style="margin-top:var(--space-sm)">${a}</div></section>
      <section class="driver-card span-4"><p class="caption-uppercase">Tool log</p><div style="margin-top:var(--space-sm)">${p}</div></section>
    </div>`}e.renderActivity=S}function Te(e){function S(){let n=e.state._infraHealth;if(!n)return`<section class="driver-card span-12">
        <div class="infra-health-head">
          <p class="caption-uppercase">Infrastructure</p>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Check health</button>
        </div>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Monitor EC2 host, S3 vault bucket, and disk on this server.</p>
      </section>`;let t=n.host||{},s=n.s3||{},l=n.disk||{},i=n.app||{},g=t.platform==="ec2"?e.infraKvRow("Instance",t.instance_id,!0)+e.infraKvRow("Region",t.region)+e.infraKvRow("Type",t.instance_type)+e.infraKvRow("IAM role",t.iam_role):e.infraKvRow("Host","Local / dev"),D=s.configured?e.infraKvRow("Bucket",s.bucket,!0)+e.infraKvRow("Region",s.region)+e.infraKvRow("Read/write",s.read_write_ok?"OK":s.reachable?"Reachable only":"Failed"):e.infraKvRow("Storage","Local disk only"),A=e.infraKvRow("Data path",l.path,!0)+e.infraKvRow("Free",l.free_gb!=null?`${l.free_gb} GB`:null)+e.infraKvRow("Used",l.used_pct!=null?`${l.used_pct}%`:null),v=!!n.ok;return`<section class="driver-card span-12">
      <div class="infra-health-head">
        <div>
          <p class="caption-uppercase">Infrastructure</p>
          <p class="world-meta">Last checked ${e.esc(e.fmtTime(n.checked_at)||n.checked_at||"\u2014")} \xB7 App storage: <strong>${e.esc(i.storage_backend||"\u2014")}</strong></p>
        </div>
        <div class="infra-health-head__actions">
          <span class="badge-pill${v?" badge-pill--ok":" badge-pill--warn"}">${v?"All checks passed":"Needs attention"}</span>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Refresh</button>
        </div>
      </div>
      <div class="infra-health-grid">
        ${e.infraHealthCard("EC2 host",t.ok!==!1,g,t.detail)}
        ${e.infraHealthCard("S3 vault",s.configured?!!s.ok:!0,D,s.detail)}
        ${e.infraHealthCard("Disk",!!l.ok,A,l.detail)}
      </div>
    </section>`}function k(){let n=e.state.config||{},t=n.integrations||{},s=e.state._whatsapp||{},l=(n.autonomy_level||"balanced").toLowerCase(),i=n.whatsapp_enabled?s.connected?`Connected${s.linked_phone?` (${e.esc(s.linked_phone)})`:""}`:s.qr_pending?"Scan QR below":"Bridge not connected":"Disabled in .env",g=s.qr_data_url?`<img src="${s.qr_data_url}" alt="WhatsApp QR code" width="280" height="280" style="margin-top:var(--space-sm);border-radius:8px">`:"",D=n.agent_paused?'<button type="button" class="button-primary" id="toggle-pause">Resume agent</button>':'<button type="button" class="button-outline-on-dark" id="toggle-pause">Pause agent</button>';return`<div class="dashboard-grid settings-page">
      ${e.renderInfrastructureHealth()}
      <section class="driver-card span-4 settings-panel">
        <p class="caption-uppercase">Identity</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Name</dt><dd>${e.esc(n.my_name)}</dd></div>
          <div class="settings-kv__row"><dt>Company</dt><dd>${e.esc(n.company_name)}</dd></div>
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
              <input type="checkbox" name="auto_approve" value="1"${n.auto_approve?" checked":""}>
              <span>Auto-approve low-risk tool calls</span>
            </label>
          </div>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save policy</button>
            ${D}
          </div>
        </form>
      </section>
      <section class="driver-card span-4 settings-panel">
        <p class="caption-uppercase">Channels</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Web UI</dt><dd>${n.web_ui_enabled?"On":"Off"}</dd></div>
          <div class="settings-kv__row"><dt>Telegram</dt><dd>${n.telegram_enabled?"On":"Off"}</dd></div>
          <div class="settings-kv__row"><dt>Port</dt><dd>${n.dashboard_port}</dd></div>
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
          ${e.integrationCard("WhatsApp",t.whatsapp&&s.connected,"Allowlisted CRM contacts only; every send needs approval")}
        </div>
      </section>
      ${n.whatsapp_enabled?`<section class="driver-card span-12 human-panel" id="whatsapp-settings-panel">
        <p class="section-eyebrow">WhatsApp</p>
        <h3 class="title-sm">Linked device</h3>
        <p class="body-md muted">Personal WhatsApp via Baileys (unofficial). Only contacts you allow in CRM are stored or messaged. Outbound always requires your approval.</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Status</dt><dd>${i}</dd></div>
          <div class="settings-kv__row"><dt>Allowlisted</dt><dd>${s.allowlist_count??s.allowlist_size??"\u2014"} contacts</dd></div>
        </dl>
        ${g}
        <p class="caption muted" style="margin-top:var(--space-xs)">Open WhatsApp \u2192 Linked devices \u2192 Link a device. QR refreshes every few seconds while pending.</p>
      </section>`:""}
    </div>`}function b(){e.whatsappPollTimer&&(clearInterval(e.whatsappPollTimer),e.whatsappPollTimer=null)}async function a(){if(e.currentView!=="settings"){e.stopWhatsappPoll();return}try{let n=await e.api("/whatsapp/status");if(e.state._whatsapp={...e.state._whatsapp||{},...n},n.qr_pending){let t=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=t.qr_data_url||null}else e.state._whatsapp.qr_data_url=null;e.currentView==="settings"&&e.render({graphs:!1})}catch{}}function p(){e.stopWhatsappPoll();let n=e.state.config||{};e.currentView!=="settings"||!n.whatsapp_enabled||(e.pollWhatsappSettings(),e.whatsappPollTimer=setInterval(a,5e3))}async function u(){let n=document.getElementById("btn-infra-refresh");n&&(n.disabled=!0);try{e.state._infraHealth=await e.api("/infrastructure/health"),e.render(),e.afterRender()}catch(t){console.error("Infrastructure health check failed:",t)}finally{n&&(n.disabled=!1)}}async function m(n){let t=new FormData(n);try{let s=await e.api("/agent/config",{method:"POST",body:JSON.stringify({autonomy_level:(t.get("autonomy_level")||"balanced").toString(),auto_approve:t.get("auto_approve")==="1"})});e.state.config={...e.state.config||{},...s},e.updateStatus(),e.render()}catch(s){alert(s.message)}}e.renderInfrastructureHealth=S,e.renderSettings=k,e.stopWhatsappPoll=b,e.pollWhatsappSettings=a,e.startWhatsappPollIfNeeded=p,e.refreshInfraHealth=u,e.saveAgentConfig=m}function Pe(e){function S(v){let y={name:"",dirs:{},files:[]};for(let L of v){let W=L.github_path||L.filename||L.title||"file",N=W.split("/").filter(Boolean),q=N.pop()||W,z=y;for(let Z of N)z.dirs[Z]||(z.dirs[Z]={name:Z,dirs:{},files:[]}),z=z.dirs[Z];z.files.push({...L,_fileName:q})}return y}function k(){return document.hidden?e.LIVE_POLL_HIDDEN_MS:e.LIVE_POLL_MS}function b(){e.livePollTimer&&clearTimeout(e.livePollTimer),e.livePollTimer=setTimeout(async()=>{await e.pollLive(),e.scheduleLivePoll()},e.livePollDelayMs())}function a(v){return e.WORLD_KINDS[v]||e.WORLD_KINDS.project}function p(v){let y=e.worldKindMeta(v||"project");return`<span class="world-kind-badge ${y.cls}">${e.esc(y.label)}</span>`}function u(){return e.state._worldFull?.worlds||e.state.worlds||{}}function m(v){e.currentView==="world"&&e.inspectorWorldId()===v?e.patchWorldPanels():e.currentView==="agents"&&e.currentWorldId()===v?e.patchAgentsVaultPanel():e.render({graphs:!1})}function n(){return(e.state._worldVault?.storage_backend||e.state._worldVault?.vault?.storage_backend)==="s3"?"S3":"local object storage"}function t(v){let y=Number(v)||0;return y<1024?`${y} B`:y<1048576?`${(y/1024).toFixed(1)} KB`:`${(y/1048576).toFixed(1)} MB`}function s(v){if(!v)return"";let y=typeof v=="number"?new Date(v*1e3):new Date(v);return Number.isNaN(y.getTime())?String(v).slice(0,16):y.toLocaleString()}function l(v,y,L=!1){let W=y==null||y===""?"\u2014":String(y);return`<div class="infra-kv"><dt>${e.esc(v)}</dt><dd${L?' class="infra-kv__val"':""}>${e.esc(W)}</dd></div>`}function i(v,y,L,W){let N=y?"Healthy":"Issue";return`<div class="integration-card infra-health-card${y?" is-connected":" is-warning"}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(v)}</span>
        <span class="integration-card__status">${N}</span>
      </div>
      <dl class="infra-kv-list">${L}</dl>
      ${W?`<p class="integration-card__detail">${e.esc(W)}</p>`:""}
    </div>`}function g(v,y,L){return`<div class="integration-card${y?" is-connected":""}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(v)}</span>
        <span class="integration-card__status">${y?"Active":"Not configured"}</span>
      </div>
      <p class="integration-card__detail">${e.esc(L)}</p>
    </div>`}async function D(v){let y=v.target.files?.[0];if(!y)return;let L=new FormData;L.append("file",y),e.chatHistory.push({role:"user",text:`\u{1F4CE} Uploaded: ${y.name}`}),e.render();try{L.append("world_id",e.currentWorldId());let W=await fetch("/api/upload",{method:"POST",body:L,credentials:"same-origin"}),N=await W.json().catch(()=>({}));if(W.status===401&&N.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!W.ok)throw new Error(N.error||W.statusText);e.chatHistory.push({role:"agent",text:N.reply})}catch(W){e.chatHistory.push({role:"system",text:"Upload failed: "+W.message})}localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),v.target.value="",e.render()}function A(){let v=document.querySelector(".app"),y=e.$("#btn-sidebar-collapse"),L="fos_sidebar_collapsed";localStorage.getItem(L)==="1"&&v?.classList.add("sidebar-collapsed");let W=()=>{let N=v?.classList.contains("sidebar-collapsed");y?.setAttribute("aria-label",N?"Expand sidebar":"Collapse sidebar"),y?.setAttribute("title",N?"Expand sidebar":"Collapse sidebar")};W(),y?.addEventListener("click",()=>{v?.classList.toggle("sidebar-collapsed"),localStorage.setItem(L,v?.classList.contains("sidebar-collapsed")?"1":"0"),W()})}e.buildGithubPathTree=S,e.livePollDelayMs=k,e.scheduleLivePoll=b,e.worldKindMeta=a,e.worldKindBadge=p,e.worldTreeData=u,e.afterVaultMutation=m,e.vaultStorageLabel=n,e.formatBytes=t,e.fmtHistoryTime=s,e.infraKvRow=l,e.infraHealthCard=i,e.integrationCard=g,e.uploadFile=D,e.initSidebarCollapse=A}function Ee(e){async function S(p){if(p==="crm"&&await e.loadCrmData(),p==="outreach"&&await e.loadOutreachData(),p==="settings"&&(e.state._whatsapp=await e.api("/whatsapp/status").catch(()=>({})),e.state._whatsapp.qr_pending)){let u=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=u.qr_data_url||null}if(p==="goals"&&(e.state._goals=await e.api("/goals")),p==="tools"&&(e.state._tools=await e.api("/tools")),p==="agents"){let[u,m,n,t,s]=await Promise.all([e.api("/agents"),e.api("/activity").catch(()=>({})),e.api("/agents/runs").catch(()=>({runs:[],actions:[]})),e.api("/crm/contacts").catch(()=>({})),e.api("/tools").catch(()=>({}))]);e.state._agents=u,e.state._agents?.specialists?.length||(e.state._agents={...e.state._agents,specialists:e.DEFAULT_SPECIALISTS}),e.state._activity=m,e.state._agentRunsApi=n.runs||[],e.state._agentActions=n.actions||m.actions||[],e.state._crm=t,e.state._tools=s;let l=e.currentWorldId();l&&l!=="root"?await e.ensureVaultForWorld(l):e.clearVaultScopedState()}if(p==="settings"&&(e.state._infraHealth=await e.api("/infrastructure/health").catch(()=>e.state._infraHealth||null)),p==="activity"&&(e.state._activity=await e.api("/activity")),p==="history"){let u=e.currentWorldId(),m=u&&u!=="root"?`?world_id=${encodeURIComponent(u)}`:"";e.state._history=await e.api(`/history${m}`).catch(()=>({sessions:[],recent_runs:[]})),e.state._artifacts=(await e.api(`/artifacts${m}`).catch(()=>({artifacts:[]}))).artifacts||[],e.state._historySelectedId?e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null):e.state._history.sessions?.[0]&&(e.state._historySelectedId=e.state._history.sessions[0].id,e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null))}if(p==="documents")if(e.state._artifacts=(await e.api("/artifacts?limit=100").catch(()=>({artifacts:[]}))).artifacts||[],e.state._documentsSelectedId)try{let u=await e.api(`/artifacts/${e.state._documentsSelectedId}/content`,{timeoutMs:15e3});e.state._documentDraft=u.content||""}catch{e.state._documentDraft=""}else e.state._documentDraft="";if(p==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldGraph=e.state._worldFull?.graph??null,e.state._worldHierarchyGraph=e.state._worldFull?.hierarchy_graph??null,e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.invalidateGraphCache("graph-world"),e.state._worldTemplates?.length||(e.state._worldTemplates=(await e.api("/world-templates").catch(()=>({}))).templates||[]),e.state.inspectorWorldId||(e.state.inspectorWorldId=e.currentWorldId()),e.state._githubStatus=await e.api("/github/status").catch(()=>({})),e.state._githubStatus?.connected?e.state._githubRepos=(await e.api("/github/repos").catch(()=>({}))).repos||[]:e.state._githubRepos=[],await e.ensureVaultForWorld(e.inspectorWorldId()),await e.resumeActiveSyncJobs(e.inspectorWorldId())),p==="memory"&&(e.state._memoryFull=await e.api("/graph/memory"),e.state._memoryGraph=e.state._memoryFull?.graph??null,e.invalidateGraphCache("graph-memory")),(p==="dashboard"||p==="chat"||p==="agents")&&(e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})))),p==="chat"){e.state._activity=await e.api("/activity").catch(()=>e.state._activity||{}),e.state._agentRunsApi=(await e.api("/agents/runs").catch(()=>({}))).runs||e.state._agentRunsApi,await e.loadChatSessionsList(),await e.loadChatFromServer();let u=e.currentWorldId();u&&u!=="root"&&await e.ensureVaultForWorld(u)}if(p==="dashboard"){e.state._world=await e.api("/world").catch(()=>e.state._world||{}),e.state._worldGraph=e.state._world?.graph??e.state._worldGraph??null,e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})));let u=e.currentWorldId(),m=u&&u!=="root"?`?world_id=${encodeURIComponent(u)}`:"";e.state._nudges=(await e.api(`/nudges${m}`).catch(()=>({nudges:[]}))).nudges||[]}["dashboard","agents","chat","world","memory"].includes(p)&&await e.loadGraphData()}async function k(p=!1){let u=e.state.activeWorldId,m=e.state.selectedSpecialist,n=e.state.ui;if(p||!e.state.config?.my_name)e.state={...e.state,...await e.api("/state")};else{let t=await e.api("/summary");e.state.usage=t.usage??e.state.usage,e.state.unread_notifications=t.unread_notifications??e.state.unread_notifications,t.worlds&&(e.state.worlds=t.worlds),t.config&&(e.state.config=t.config),e.state.snapshot={...e.state.snapshot||{},approvals_pending:t.approvals_pending??e.state.snapshot?.approvals_pending??0,reminders_pending:t.reminders_pending??e.state.snapshot?.reminders_pending??0,tasks_open:t.tasks_open??e.state.snapshot?.tasks_open??0,crm:{...e.state.snapshot?.crm||{},followups_due:t.crm_followups_due??e.state.snapshot?.crm?.followups_due??0}}}e.state.activeWorldId=u||e.state.activeWorldId||"root",e.state.selectedSpecialist=m??e.state.selectedSpecialist??"",e.state.ui=n||e.state.ui;try{e.populateWorldSelect(),e.populateSpecialistSelect()}catch(t){console.error("populate selects failed:",t)}e.updateBadges(),e.updateStatus(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function b(){}function a(){e.refreshTimer&&clearTimeout(e.refreshTimer),!document.hidden&&(e.refreshTimer=setTimeout(async()=>{try{await e.refresh(!1),e.updateBadges(),e.updateStatus()}catch(p){console.error(p),e.setConnectionStatus("Reconnecting\u2026","paused")}e.scheduleBackgroundRefresh()},e.REFRESH_MS))}e.loadViewData=S,e.refresh=k,e.loadBootExtras=b,e.scheduleBackgroundRefresh=a}function We(e){function S(){return window.FOS_MOBILE_PRIMARY_VIEWS||new Set(["dashboard","chat","agents","world"])}function k(){document.getElementById("sidebar")?.classList.remove("is-open"),document.body.classList.remove("mobile-nav-open");let i=document.getElementById("sidebar-backdrop");i&&(i.classList.remove("is-visible"),i.setAttribute("hidden","")),document.getElementById("mobile-menu-drawer")?.close?.()}function b(){let i=document.getElementById("sidebar"),g=document.getElementById("sidebar-backdrop");!i||!g||(i.classList.add("is-open"),document.body.classList.add("mobile-nav-open"),g.removeAttribute("hidden"),requestAnimationFrame(()=>g.classList.add("is-visible")))}function a(i){let g=e.mobilePrimaryViews();document.querySelectorAll(".mobile-tab").forEach(D=>{let A=D.dataset.mobileView;A==="more"?D.classList.toggle("is-active",!g.has(i)):D.classList.toggle("is-active",A===i)}),document.querySelectorAll(".mobile-menu-link").forEach(D=>{D.classList.toggle("is-active",D.dataset.view===i)})}function p(i,g={}){let D=g.params??(i===e.currentView?e.routeParams:{})??{};g.skipUrl?e.applyRouteParams(i,D):e.updateRoute(i,D,{replace:!!g.replace}),e.currentView=i,i!=="outreach"&&e.state._crmOutreachPollId&&(clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null),e.$$(".nav button").forEach(v=>v.classList.toggle("is-active",v.dataset.view===i)),e.$("#view-title").textContent=e.TITLES[i]||i,e.syncMobileNav(i),e.closeMobileShell(),FOSMotion?.animateTopbarTitle?.(),["dashboard","agents","chat","activity","world"].includes(i)?e.startLivePoll():e.stopLivePoll();let A=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1}),e.loadViewData(i).then(()=>{A===e.viewDataLoadGen&&(e.setViewLoading(!1),e.render())}).catch(v=>{console.error(v),A===e.viewDataLoadGen&&e.setViewLoading(!1)})}function u(i={}){try{e.currentView==="dashboard"&&e.drawDashboardCharts()}catch(v){console.warn("dashboard charts skipped:",v)}try{i.graphs!==!1&&e.drawGraphs()}catch(v){console.warn("graphs skipped:",v)}e.state._motionSkipOnce?e.state._motionSkipOnce=!1:FOSMotion?.runView?.(e.currentView),FOSMotion?.ensureContentVisible?.();let g=document.getElementById("content"),D=window.FOSMarkdown?.enhance?.(g),A=()=>{(e.currentView==="chat"||e.currentView==="agents")&&e.initMsgReadMore(g)};if(D?.then?D.then(A).catch(A):A(),e.currentView==="documents"&&!e.documentsEditMode){let v=e.$("#docs-preview");v&&window.FOSMarkdown?.renderInto?.(v,e.state._documentDraft??"")}e.startWhatsappPollIfNeeded(),e.currentView==="outreach"&&e.outreachStep?.()==="setup"&&e.syncOutreachCompanyPickerUi?.()}function m(){let i=(e.state.approvals||[]).length,g=e.$("#nav-approval-badge");g&&(g.textContent=i,g.hidden=!i);let D=e.$("#mobile-approval-badge");D&&(D.textContent=i,D.hidden=!i);let A=e.$("#mobile-menu-approval-badge");A&&(A.textContent=i,A.hidden=!i);let v=e.state.unread_notifications||0,y=e.$("#notif-badge");y&&(y.textContent=v,y.hidden=!v)}function n(i,g="ok"){let D=e.$("#status-dot"),A=e.$("#status-text"),v=e.$("#mobile-status-dot"),y=e.$("#mobile-status-text");A&&(A.textContent=i),y&&(y.textContent=i),D?.classList.toggle("ok",g==="ok"),D?.classList.toggle("paused",g!=="ok"),v?.classList.toggle("ok",g==="ok"),v?.classList.toggle("paused",g!=="ok")}function t(){let i=e.state.config||{};i.agent_paused?e.setConnectionStatus("Agent paused","paused"):e.setConnectionStatus("Online","ok");let g=e.$("#brand-sub");g&&(g.textContent=i.my_name||i.company_name||e.APP_NAME),document.title=i.my_name?`${e.APP_NAME} \u2014 ${i.my_name}`:e.APP_NAME}async function s(i,g){g&&(await e.api(`/notifications/${encodeURIComponent(g)}/read`,{method:"POST"}).catch(()=>{}),await e.refresh(),e.updateBadges()),i==="approvals"?e.goView("approvals"):i==="crm"?e.goView("crm"):i==="outreach"?e.goView("outreach"):i==="goals"?e.goView("goals"):i==="chat"?e.goView("chat"):e.goView(i||"dashboard"),e.$("#notif-drawer")?.close()}function l(){let i=e.state.notifications||[];e.$("#notif-list").innerHTML=i.length?i.map(g=>{let D=g.meta?.action||(g.kind==="approval"?"approvals":g.kind==="agent"?"chat":""),A=D?`<button type="button" class="button-outline-on-dark button-sm" data-notif-action="${e.esc(D)}" data-notif-id="${e.esc(g.id)}" style="margin-top:8px">Open</button>`:"",v=g.meta?.url,y=!A&&v?`<a class="button-outline-on-dark button-sm" href="${e.esc(v)}" target="_blank" rel="noopener" style="margin-top:8px;display:inline-block">Open</a>`:"";return`
      <div class="notif-item ${g.read?"":"unread"}" data-notif-id="${e.esc(g.id)}">
        <div class="title">${e.esc(g.title)}</div>
        <div class="body">${e.esc(g.body)}</div>
        <div class="muted" style="font-size:11px;margin-top:4px">${e.fmtTime(g.ts)}</div>
        ${A||y}
      </div>`}).join(""):"<p class='muted'>No notifications yet.</p>"}e.mobilePrimaryViews=S,e.closeMobileShell=k,e.openSidebar=b,e.syncMobileNav=a,e.goView=p,e.afterRender=u,e.updateBadges=m,e.setConnectionStatus=n,e.updateStatus=t,e.openNotificationAction=s,e.renderNotifications=l}function Ve(e){function S(){let k=document.getElementById("content");!k||k.dataset.delegation==="1"||(k.dataset.delegation="1",k.addEventListener("click",b=>{let a=b.target.closest("[data-operator],[data-toggle-ui],[data-goto],[data-approve],[data-reject],[data-select-specialist],[data-agents-tab],[data-toggle-run],[data-memory-tab],[data-inspect-world],[data-world-graph-tab],[data-use-world],[data-set-active-world],[data-edit-world],[data-cancel-edit],[data-delete-world],[data-vault-ingest],[data-vault-link],[data-vault-search],[data-vault-facet],[data-vault-add-doc],[data-vault-cancel-doc],[data-vault-edit-doc],[data-vault-delete-doc],[data-vault-view-doc],[data-vault-reload],[data-github-add],[data-github-sync],[data-github-unlink],[data-goal-done],[data-history-tab],[data-history-session],[data-open-chat-session],[data-new-chat-session],[data-chat-session],[data-cancel-job],[data-cancel-active-job],[data-md-artifact],[data-open-document],[data-select-document],[data-docs-action],[data-tag-vault-doc],[data-nudge-index],[data-remove-attachment],[data-open-vault-picker],[data-pick-vault-doc],[data-crm-followup],[data-crm-wa-thread],[data-crm-tab],[data-crm-company-detail],[data-crm-company-close],[data-crm-import-companies],[data-crm-reload],[data-crm-outreach-start],[data-crm-campaign],[data-crm-draft-approve],[data-crm-draft-skip],[data-crm-company-toggle],[data-crm-skip-company],[data-crm-outreach-refresh],[data-crm-outreach-back],[data-outreach-open-crm-companies],[data-outreach-save-companies],[data-msg-read-more],#chat-send,#chat-clear,#memory-search,#toggle-pause,#agents-vault-search,#delegate-selected-btn,#btn-logout,#btn-infra-refresh");if(!a)return;let p=()=>{if(a.dataset.msgReadMore){e.state._msgExpand||(e.state._msgExpand={});let u=a.dataset.msgReadMore;e.state._msgExpand[u]=(e.state._msgExpand[u]||0)+1,e.initMsgReadMore(a.closest(".msg-read-more-host")||k);return}if(a.id==="chat-send")return e.sendChat();if(a.id==="chat-clear")return e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.setChatSessionId(null),e.render();if(a.id==="memory-search")return e.searchMemory();if(a.id==="toggle-pause")return e.togglePause();if(a.id==="agents-vault-search")return e.agentsVaultSearch();if(a.id==="delegate-selected-btn")return e.delegateAgent();if(a.id==="btn-logout")return e.logoutPin();if(a.id==="btn-infra-refresh")return e.refreshInfraHealth();if(a.dataset.operator)return e.openOperatorAction(a.dataset.operator);if(a.dataset.toggleUi)return e.state.ui||(e.state.ui={}),e.state.ui[a.dataset.toggleUi]=!e.state.ui[a.dataset.toggleUi],e.render();if(a.dataset.goto)return e.goView(a.dataset.goto);if(a.dataset.approve)return e.decideApproval(a.dataset.approve,!0);if(a.dataset.reject)return e.decideApproval(a.dataset.reject,!1);if(a.dataset.selectSpecialist!==void 0)return e.selectSpecialist(a.dataset.selectSpecialist||"");if(a.dataset.agentsTab){e.state.agentsTab=a.dataset.agentsTab,localStorage.setItem("fos_agents_tab",e.state.agentsTab),e.render(),e.state.agentsTab==="vault"?e.onWorldContextChanged({vaultWorldId:e.currentWorldId(),forceVault:!1}).then(()=>e.patchAgentsVaultPanel()):e.drawGraphs();return}if(a.dataset.toggleRun){let u=a.dataset.toggleRun;return e.state.expandedRunId=e.state.expandedRunId===u?null:u,e.render()}if(a.dataset.memoryTab)return e.memoryGraphTab=a.dataset.memoryTab,e.render({graphs:!1});if(a.dataset.inspectWorld)return e.selectInspectorWorld(a.dataset.inspectWorld);if(a.dataset.worldGraphTab)return e.switchWorldGraphTab(a.dataset.worldGraphTab);if(a.dataset.useWorld)return e.setActiveWorld(a.dataset.useWorld),e.goView("chat");if(a.dataset.setActiveWorld)return e.setActiveWorld(a.dataset.setActiveWorld),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.onWorldContextChanged({vaultWorldId:a.dataset.setActiveWorld,forceVault:!0}).then(()=>e.currentView==="world"?e.patchWorldPanels():e.render({graphs:!1}));if(a.dataset.editWorld)return e.state.worldEditing=a.dataset.editWorld,e.render();if(a.dataset.cancelEdit!==void 0)return e.state.worldEditing=null,e.render();if(a.dataset.deleteWorld)return e.deleteWorld(a.dataset.deleteWorld);if(a.dataset.vaultIngest)return e.vaultIngest(a.dataset.vaultIngest);if(a.dataset.vaultLink)return e.vaultLinkRepo(a.dataset.vaultLink);if(a.dataset.vaultSearch)return e.vaultSearch(a.dataset.vaultSearch);if(a.dataset.vaultReload)return e.reloadVaultFromServer(a.dataset.vaultReload);if(a.dataset.vaultFacet)return e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=a.dataset.vaultFacet,e.patchWorldPanels();if(a.dataset.vaultAddDoc!==void 0)return e.state.ui||(e.state.ui={}),e.state.ui.vaultDocForm=!0,e.state.ui.vaultDocEdit=null,e.patchWorldPanels();if(a.dataset.vaultCancelDoc!==void 0)return e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),e.patchWorldPanels();if(a.dataset.vaultEditDoc)return e.startVaultDocEdit(e.inspectorWorldId(),a.dataset.vaultEditDoc);if(a.dataset.vaultViewDoc){let u=a.dataset.worldId||e.inspectorWorldId(),m=a.dataset.vaultViewDoc;return m?e.openVaultDocViewer(u,m,a.dataset.docTitle||"Document"):void 0}if(a.dataset.tagVaultDoc)return e.tagVaultDocInChat(a.dataset.tagVaultDoc,a.dataset.worldId,a.dataset.docTitle,a.dataset.docPath);if(a.dataset.nudgeIndex!==void 0)return e.handleNudgeAction(a.dataset.nudgeIndex);if(a.dataset.removeAttachment!==void 0){let u=Number(a.dataset.removeAttachment);return Number.isNaN(u)||e.state._chatAttachments?.splice(u,1),e.render()}if(a.dataset.openVaultPicker!==void 0)return e.openVaultAttachPicker().catch(u=>alert(u.message));if(a.dataset.pickVaultDoc){e.tagVaultDocInChat(a.dataset.pickVaultDoc,a.dataset.worldId,a.dataset.docTitle,a.dataset.docPath),e.$("#vault-picker-dialog")?.close();return}if(a.dataset.crmTab)return e.state.ui||(e.state.ui={}),e.state.ui.crmTab=a.dataset.crmTab,localStorage.setItem("fos_crm_tab",e.state.ui.crmTab),e.loadCrmData().then(()=>e.render());if(a.dataset.crmOutreachRefresh!==void 0){let u=e.state.ui?.crmCampaignId;return u?e.pollCrmOutreachJob(u,!0):e.loadOutreachData().then(()=>e.render())}if(a.hasAttribute("data-outreach-save-companies"))return e.saveOutreachCompanySelection();if(a.hasAttribute("data-outreach-open-crm-companies"))return e.state.ui||(e.state.ui={}),e.state.ui.crmTab="companies",localStorage.setItem("fos_crm_tab","companies"),e.goView("crm");if(a.dataset.crmCompanyDetail)return e.openCrmCompanyDetail(a.dataset.crmCompanyDetail);if(a.dataset.crmCompanyClose!==void 0)return e.state.ui&&(e.state.ui.crmCompanyDetail=null),e.state._crmCompanyDetail=null,e.render();if(a.dataset.crmImportCompanies!==void 0)return e.importCrmCompaniesFromContacts();if(a.dataset.crmReload!==void 0)return e.loadCrmData().then(()=>e.render());if(a.dataset.crmFollowup)return e.scheduleCrmFollowup(a.dataset.crmFollowup,a.dataset.followupDays);if(a.dataset.crmWaThread)return e.loadCrmWaThread(a.dataset.crmWaThread);if(a.dataset.crmCampaign)return e.openCrmCampaignReview(a.dataset.crmCampaign);if(a.hasAttribute("data-crm-outreach-back"))return e.closeCrmCampaignReview();if(a.dataset.crmDraftApprove)return e.approveCrmDraft(a.dataset.crmDraftApprove);if(a.dataset.crmDraftSkip)return e.skipCrmDraft(a.dataset.crmDraftSkip);if(a.dataset.crmSkipCompany)return e.skipCrmCompany(a.dataset.crmSkipCompany);if(a.dataset.reminderDone)return e.updateReminderStatus(a.dataset.reminderDone,"done");if(a.dataset.reminderCancel)return e.updateReminderStatus(a.dataset.reminderCancel,"cancelled");if(a.dataset.notifAction)return e.openNotificationAction(a.dataset.notifAction,a.dataset.notifId);if(a.dataset.vaultDeleteDoc)return e.deleteVaultDoc(e.inspectorWorldId(),a.dataset.vaultDeleteDoc);if(a.dataset.githubAdd)return e.connectGithubRepo(a.dataset.githubAdd);if(a.dataset.githubSync)return e.syncGithubRepo(a.dataset.worldId,a.dataset.githubSync);if(a.dataset.githubUnlink)return e.unlinkGithubRepo(a.dataset.worldId,a.dataset.githubUnlink);if(a.dataset.goalDone)return e.markGoalDone(a.dataset.goalDone);if(a.dataset.historyTab)return e.historyTab=a.dataset.historyTab,localStorage.setItem("fos_history_tab",e.historyTab),e.render();if(a.dataset.historySession)return e.loadHistorySession(a.dataset.historySession);if(a.dataset.openChatSession)return e.setChatSessionId(a.dataset.openChatSession),e.loadChatFromServer().then(()=>e.goView("chat"));if(a.hasAttribute("data-new-chat-session"))return e.setChatSessionId(null),e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.loadChatSessionsList().then(()=>{e.currentView==="chat"?e.render():e.goView("chat")});if(a.dataset.chatSession)return e.setChatSessionId(a.dataset.chatSession),e.loadChatFromServer().then(()=>e.render());if(a.dataset.cancelJob)return e.cancelActiveJob(a.dataset.cancelJob);if(a.dataset.cancelActiveJob!==void 0)return e.cancelActiveJob();if(a.dataset.openDocument)return e.openDocumentsWorkspace(Number(a.dataset.openDocument));if(a.dataset.mdArtifact)return e.openDocumentsWorkspace(Number(a.dataset.mdArtifact));if(a.dataset.selectDocument)return e.selectDocument(a.dataset.selectDocument);if(a.dataset.docsAction){let u=a.dataset.docsAction;if(u==="new")return e.createNewDocument().catch(m=>alert(m.message));if(u==="toggle")return e.documentsEditMode&&(e.state._documentDraft=document.getElementById("docs-source")?.value??e.state._documentDraft),e.documentsEditMode=!e.documentsEditMode,e.render();if(u==="save")return e.saveCurrentDocument().catch(m=>alert(m.message));if(u==="memory")return e.saveDocumentToMemory().catch(m=>alert(m.message))}};return e.shouldSkipActionBusy(a)?p():e.runWithActionBusy(p,a)}),k.addEventListener("submit",b=>{let a=b.target;if(!(a instanceof HTMLFormElement))return;let p={"world-create-form":e.createWorldFromForm,"crm-create-form":e.submitCrmContact,"crm-company-form":e.submitCrmCompany,"crm-outreach-form":e.submitCrmOutreach,"goal-create-form":e.submitGoal,"reminder-create-form":e.submitReminder,"agent-config-form":e.saveAgentConfig,"world-edit-form":e.saveWorldEdit,"vault-doc-form":e.submitVaultDoc};if(p[a.id]){b.preventDefault();let u=a.querySelector('[type="submit"]');e.runWithActionBusy(()=>p[a.id](a),u)}}),k.addEventListener("change",b=>{if(b.target.id==="chat-file")return e.uploadFile(b);if(b.target.id==="docs-upload"){let a=b.target.files?.[0];a&&e.uploadDocumentFile(a).catch(p=>alert(p.message)),b.target.value="";return}if(b.target.id==="specialist-select-agents"||b.target.id==="chat-specialist-select")return e.selectSpecialist(b.target.value);if(b.target.id==="rag-mode-select"){e.state.ragMode=b.target.value||"auto",localStorage.setItem("fos_rag_mode",e.state.ragMode);return}b.target.matches("[data-crm-status]")&&e.updateCrmStatus(b.target.dataset.crmStatus,b.target.value),b.target.matches("[data-crm-whatsapp]")&&e.updateCrmWhatsapp(b.target.dataset.crmWhatsapp,b.target.checked),b.target.matches("[data-crm-company-toggle]")&&e.toggleOutreachDraftCompany(b.target),b.target.id==="crm-outreach-batch"&&e.setOutreachBatchSize(b.target.value),b.target.id==="crm-outreach-world"&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld=b.target.value,e.restoreOutreachSelectionForWorld(b.target.value),e.loadOutreachData().then(()=>e.render()))}),k.addEventListener("blur",b=>{if(b.target.matches(".crm-draft-subject, .crm-draft-body")){let a=b.target.dataset.draftId;a&&e.saveCrmDraftEdits(a).catch(()=>{})}},!0),k.addEventListener("keydown",b=>{b.target.id==="chat-input"&&b.key==="Enter"&&!b.shiftKey&&(b.preventDefault(),e.sendChat()),b.target.id==="memory-q"&&b.key==="Enter"&&e.searchMemory()}),k.addEventListener("input",b=>{if(b.target.id==="outreach-company-search"&&e.filterOutreachCompanyList(b.target.value),b.target.matches(".crm-draft-body[data-channel='whatsapp']")){let a=b.target.dataset.draftId,p=document.querySelector(`.crm-wa-count[data-draft-id="${a}"]`);p&&(p.textContent=`${b.target.value.length}/300`)}b.target.id==="delegate-selected"&&(e.state._delegateDraft=b.target.value)}))}e.initContentDelegation=S}function Me(e){function S(a="rag-mode-select"){let p=e.RAG_MODES.map(u=>`<option value="${e.esc(u.id)}" title="${e.esc(u.hint)}">${e.esc(u.label)}</option>`).join("");return`<label class="chat-control">
      <span class="caption-uppercase">Retrieval</span>
      <select id="${e.esc(a)}" class="world-select agent-select" aria-label="RAG mode">${p}</select>
    </label>`}function k(){requestAnimationFrame(()=>{let a=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),p=a?.[a.length-1];FOSMotion?.animateNewMessage?.(p)})}function b(a={}){let p=e.$("#content");if(!p)return;let u={dashboard:e.renderDashboard,chat:e.renderChat,agents:e.renderAgents,world:e.renderWorld,approvals:e.renderApprovals,crm:e.renderCrm,outreach:e.renderOutreach,goals:e.renderGoals,memory:e.renderMemory,history:e.renderHistory,documents:e.renderDocuments,tools:e.renderTools,activity:e.renderActivity,settings:e.renderSettings};try{if(e.state._viewLoading)p.innerHTML=e.renderViewSkeleton(e.currentView);else{let n=u[e.currentView]||e.renderDashboard;p.innerHTML=n()}}catch(n){console.error("render failed:",n),p.innerHTML=`<div class="driver-card span-12">
        <p class="title-md">Dashboard could not render</p>
        <p class="body-md muted" style="margin-top:8px">${e.esc(n?.message||String(n))}</p>
        <button type="button" class="button-primary button-sm" id="render-retry" style="margin-top:12px">Retry</button>
      </div>`,e.$("#render-retry")?.addEventListener("click",()=>e.boot());return}document.querySelector(".content")?.classList.toggle("content--worlds",e.currentView==="world"),document.querySelector(".content")?.classList.toggle("content--wide",["agents","world","activity","chat","history","documents"].includes(e.currentView)),document.querySelector(".content")?.classList.toggle("content--chat",e.currentView==="chat"),e.populateSpecialistSelect();let m=e.$("#rag-mode-select");if(m&&(m.value=e.state.ragMode||"auto"),a.post!==!1&&(e.afterRender({graphs:a.graphs!==!1}),e.state._scrollWorldCreate&&e.currentView==="world"&&(e.state._scrollWorldCreate=!1,requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"})))),e.currentView==="chat"){let n=e.$("#chat-messages");n&&(n.scrollTop=n.scrollHeight)}}e.renderRagModeSelect=S,e.animateLatestChatMessage=k,e.render=b}function Fe(e){function S(t){console.error(`${e.APP_NAME} boot failed:`,t),e.setConnectionStatus("Offline","paused");let s=e.esc(t?.message||String(t));e.$("#content").innerHTML=`<div class="driver-card span-12">
      <p class="title-md">Could not connect to ${e.esc(e.APP_NAME)}</p>
      <p class="body-md muted" style="margin-top:8px">${s}</p>
      <p class="body-md muted" style="margin-top:12px">Make sure <code>python main.py</code> is running, then tap <strong>Refresh</strong> in the top bar.</p>
    </div>`}function k(t,s){let l=e.$("#pin-gate"),i=document.querySelector(".app"),g=e.$("#pin-error"),D=e.$("#pin-input");l&&(l.hidden=!1,l.classList.add("is-visible")),i&&i.setAttribute("inert",""),g&&(t?(g.textContent=t,g.hidden=!1):(g.hidden=!0,g.textContent="")),D&&!s&&(D.disabled=!1,D.focus()),D&&s&&(D.disabled=!0,g&&(g.textContent=`Too many attempts. Wait ${s}s.`,g.hidden=!1)),e.setConnectionStatus("Locked","paused")}function b(){let t=e.$("#pin-gate"),s=document.querySelector(".app");t&&(t.hidden=!0,t.classList.remove("is-visible")),s&&s.removeAttribute("inert")}async function a(){return(await fetch("/api/auth/status",{credentials:"same-origin",headers:{Accept:"application/json"}})).json()}function p(){window.__FOS_PIN_BOUND||(window.__FOS_PIN_BOUND=!0,e.$("#pin-form")?.addEventListener("submit",async t=>{t.preventDefault();let s=(e.$("#pin-input")?.value||"").trim(),l=e.$("#pin-error");if(!/^\d{6}$/.test(s)){l&&(l.textContent="Enter exactly 6 digits",l.hidden=!1);return}try{let i=await fetch("/api/auth/pin",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:s})}),g=await i.json().catch(()=>({}));if(!i.ok)throw new Error(g.error||"Incorrect PIN");e.hidePinGate(),e.$("#pin-input").value="",l&&(l.hidden=!0),await e.startApp()}catch(i){l&&(l.textContent=i.message,l.hidden=!1);let g=await e.fetchAuthStatus().catch(()=>({}));g.locked_seconds&&e.showPinGate(i.message,g.locked_seconds)}}),e.$("#pin-input")?.addEventListener("input",t=>{t.target.value=t.target.value.replace(/\D/g,"").slice(0,6)}))}function u(){e.resolveBootRoute();let t=new URLSearchParams(location.search),s=t.get("world");s&&(e.state.inspectorWorldId=s,e.setActiveWorld(s));let l=t.get("companies");if(l&&e.currentView==="outreach"){let i=l.split(",").map(g=>parseInt(g.trim(),10)).filter(Boolean);i.length&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=i),t.delete("companies")}if(t.get("github")==="connected"||t.get("github_error")){let i=t.get("github_error");i&&console.warn("GitHub auth:",i),t.delete("github"),t.delete("github_error");let g=location.pathname||"/",D=t.toString();history.replaceState({},"",g+(D?`?${D}`:""))}}async function m(){e.applyBootUrlParams(),e.$$(".nav button").forEach(s=>s.classList.toggle("is-active",s.dataset.view===e.currentView)),e.$("#view-title").textContent=e.TITLES[e.currentView]||e.currentView,e.syncMobileNav(e.currentView);try{await e.refresh(!0)}catch(s){e.showBootError(s);return}let t=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1});try{if(await e.loadViewData(e.currentView),t!==e.viewDataLoadGen)return;e.setViewLoading(!1),e.render()}catch(s){console.error(s),t===e.viewDataLoadGen&&e.setViewLoading(!1)}e.startLivePoll(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function n(){e.initContentDelegation(),e.initMdEditorDialog(),e.bindPinGate();let t=window.__FOS_AUTH;if(!t)try{t=await e.fetchAuthStatus()}catch(s){e.showBootError(s);return}if(t.pin_required&&!t.authenticated){e.showPinGate(null,t.locked_seconds||0);return}e.hidePinGate(),await e.startApp()}e.showBootError=S,e.showPinGate=k,e.hidePinGate=b,e.fetchAuthStatus=a,e.bindPinGate=p,e.applyBootUrlParams=u,e.startApp=m,e.boot=n}var re={dashboard:"/",chat:"/ask",agents:"/agents",world:"/worlds",crm:"/crm",outreach:"/outreach",goals:"/goals",memory:"/memory",documents:"/documents",history:"/history",approvals:"/approvals",tools:"/tools",activity:"/activity",settings:"/settings"},Ge=new Set(Object.keys(re)),Ne={"/chat":"chat","/control":"dashboard","/dashboard":"dashboard"},je=Object.fromEntries(Object.entries(re).map(([e,S])=>[e,S]));function pt(e){return!e||e==="/"?"/":e.replace(/\/+$/,"")||"/"}function oe(e){let S=pt(e),k=S.match(/^\/outreach\/campaigns\/(\d+)(?:\/review)?$/);if(k)return{view:"outreach",params:{campaignId:parseInt(k[1],10)}};if(S==="/outreach")return{view:"outreach",params:{}};if(Ne[S]){let b=Ne[S];return{view:b,params:{},redirect:je[b]}}for(let[b,a]of Object.entries(re))if(a===S)return{view:b,params:{}};return{view:"dashboard",params:{},redirect:"/"}}function ne(e,S={}){return e==="outreach"&&S.campaignId?`/outreach/campaigns/${S.campaignId}`:je[e]||"/"}function Be(e){let S=!1;function k(n,t={}){e.routeParams={...t},n==="outreach"&&(e.state.ui||(e.state.ui={}),t.campaignId?e.state.ui.crmCampaignId=t.campaignId:(t.campaignId===null||t.campaignId===void 0)&&(t.keepCampaign||(e.state.ui.crmCampaignId=null)),t.companies?.length&&(e.state.ui.crmOutreachSelected=t.companies.map(Number).filter(Boolean)))}function b(n,t={},{replace:s=!1}={}){Ge.has(n)||(n="dashboard");let l=ne(n,t),i=window.location.search||"",g=l+i,D=window.location.pathname+i;if(g!==D){let A={view:n,params:t};s?window.history.replaceState(A,"",g):window.history.pushState(A,"",g)}k(n,t)}function a({replace:n=!1}={}){let t=oe(window.location.pathname);if(t.redirect){let s=window.location.search||"";window.history.replaceState({view:t.view,params:t.params},"",t.redirect+s)}return k(t.view,t.params),e.currentView=t.view,t}function p(){return localStorage.getItem("fos_crm_tab")==="outreach"?(localStorage.removeItem("fos_crm_tab"),{view:"outreach",params:{}}):null}function u(){let n=new URLSearchParams(window.location.search),t=n.get("view");if(t&&Ge.has(t)){n.delete("view");let l=ne(t,{}),i=n.toString(),g=l+(i?`?${i}`:"");return window.history.replaceState({view:t,params:{}},"",g),k(t,{}),e.currentView=t,{view:t,params:{}}}let s=p();if(s&&window.location.pathname==="/"){let l=window.location.search||"";return window.history.replaceState(s,"",ne(s.view,s.params)+l),k(s.view,s.params),e.currentView=s.view,s}return a({replace:!0})}function m(){window.addEventListener("popstate",()=>{if(S)return;let n=oe(window.location.pathname);k(n.view,n.params),e.goView(n.view,{skipUrl:!0,params:n.params,fromPopstate:!0})})}e.routeParams={},e.pathToRoute=oe,e.routeToPath=ne,e.updateRoute=b,e.syncRouteFromLocation=a,e.resolveBootRoute=u,e.applyRouteParams=k,e.initRouter=m,e._routerSuppressPopstate=n=>{S=n}}function He(e){e.$$(".nav button").forEach(m=>m.addEventListener("click",()=>e.goView(m.dataset.view))),e.$("#btn-sidebar-open")?.addEventListener("click",e.openSidebar);let S=document.querySelector(".app"),k=e.$("#btn-sidebar-collapse"),b="fos_sidebar_collapsed";localStorage.getItem(b)==="1"&&S?.classList.add("sidebar-collapsed");let a=()=>{let m=S?.classList.contains("sidebar-collapsed");k?.setAttribute("aria-label",m?"Expand sidebar":"Collapse sidebar"),k?.setAttribute("title",m?"Expand sidebar":"Collapse sidebar")};a(),k?.addEventListener("click",()=>{S?.classList.toggle("sidebar-collapsed"),localStorage.setItem(b,S?.classList.contains("sidebar-collapsed")?"1":"0"),a()}),e.$("#vault-picker-close")?.addEventListener("click",()=>e.$("#vault-picker-dialog")?.close()),e.$("#vault-picker-dialog")?.addEventListener("click",m=>{m.target.id==="vault-picker-dialog"&&e.$("#vault-picker-dialog").close()}),e.$("#sidebar-close")?.addEventListener("click",e.closeMobileShell),e.$("#sidebar-backdrop")?.addEventListener("click",e.closeMobileShell),document.querySelectorAll(".mobile-tab").forEach(m=>{m.addEventListener("click",()=>{let n=m.dataset.mobileView;n==="more"?(e.syncMobileNav(e.currentView),document.getElementById("mobile-menu-drawer")?.showModal()):e.goView(n)})}),document.querySelectorAll(".mobile-menu-link").forEach(m=>{m.addEventListener("click",()=>e.goView(m.dataset.view))});let p=e.$("#mobile-menu-drawer");e.$("#mobile-menu-close")?.addEventListener("click",()=>p?.close()),p?.addEventListener("click",m=>{m.target===p&&p.close()}),e.$("#btn-refresh")?.addEventListener("click",async()=>{await e.refresh();let m=++e.viewDataLoadGen;e.setViewLoading(!0);try{await e.loadViewData(e.currentView),m===e.viewDataLoadGen&&e.render()}finally{m===e.viewDataLoadGen&&e.setViewLoading(!1)}}),window.addEventListener("resize",()=>{window.innerWidth>900&&e.closeMobileShell()});let u=e.$("#notif-drawer");e.$("#btn-notifications")?.addEventListener("click",()=>{e.renderNotifications(),u?.showModal()}),u?.addEventListener("click",m=>{m.target===u&&u.close()}),e.$("#notif-read-all")?.addEventListener("click",async()=>{await e.api("/notifications/read-all",{method:"POST"}),await e.refresh(),e.renderNotifications(),e.updateBadges()}),e.$("#world-select")?.addEventListener("change",async m=>{let n=m.target,t=n.value||"root";n.disabled=!0;try{e.setActiveWorld(t),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.currentView==="world"&&(e.state.inspectorWorldId=t,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.patchWorldPanels()),await e.onWorldContextChanged({vaultWorldId:t,forceVault:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.state.agentsTab==="vault"?e.patchAgentsVaultPanel():e.render({graphs:!1}),e.updateWorldContextChrome()}catch(s){console.error("world switch failed:",s)}finally{n.disabled=!1}}),window.addEventListener("error",m=>{console.error("UI error:",m.error||m.message),e.state?.config?.my_name||e.setConnectionStatus("UI error \u2014 hard refresh","paused")}),document.addEventListener("visibilitychange",()=>{document.hidden?(e.refreshTimer&&(clearTimeout(e.refreshTimer),e.refreshTimer=null),e.stopLivePoll()):(e.scheduleBackgroundRefresh(),!e.livePollTimer&&e.state?.config&&e.startLivePoll())})}var H={};function mt(){ie(H),le(H),de(H),ce(H),pe(H),ue(H),me(H),he(H),fe(H),ge(H),be(H),ve(H),ye(H),we(H),_e(H),$e(H),Se(H),ke(H),Ce(H),Ie(H),Ae(H),Le(H),Oe(H),Re(H),De(H),Te(H),Pe(H),Ee(H),We(H),Ve(H),Me(H),Fe(H),Be(H)}mt();H.initRouter();He(H);window.__FOS=H;Object.defineProperty(window,"currentView",{get:()=>H.currentView,set:e=>{H.currentView=e}});window.drawGraphs=(...e)=>H.drawGraphs(...e);window.drawDashboardCharts=(...e)=>H.drawDashboardCharts(...e);window.render=(...e)=>H.render(...e);H.boot();H.scheduleBackgroundRefresh();
