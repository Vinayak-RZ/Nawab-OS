var Ue=(e,S=document)=>S.querySelector(e),qe=(e,S=document)=>[...S.querySelectorAll(e)];function ie(e){e.$=Ue,e.$$=qe}function Je(e){let S=document.createElement("div");return S.textContent=e??"",S.innerHTML}function Ke(e){return"$"+Number(e||0).toLocaleString(void 0,{maximumFractionDigits:0})}function ze(e){return e?new Date(typeof e=="number"&&e<1e12?e*1e3:e).toLocaleString():""}function Ye(e){return new Promise(S=>setTimeout(S,e))}function le(e){e.esc=Je,e.fmtMoney=Ke,e.fmtTime=ze,e.sleep=Ye}function Qe(e,S){try{let k=localStorage.getItem(e);return k?JSON.parse(k):S}catch(k){return console.warn(`[storage] corrupt ${e}, resetting`,k),localStorage.removeItem(e),S}}function de(e){e.readJsonStorage=Qe}var Xe="Nawab OS",Ze=[{id:"pulse",label:"Pulse",role:"aggregator",tool_count:0,brief:"Operating pulse across parallel projects"},{id:"outreach",label:"Outreach",role:"outreach",tool_count:0,brief:"Outreach drafts and CRM pipeline"},{id:"leads",label:"Leads",role:"leads",tool_count:0,brief:"Lead lists and contact priorities"},{id:"market",label:"Market intel",role:"research",tool_count:0,brief:"Industry and competitor intelligence"},{id:"vault",label:"Vault",role:"knowledge",tool_count:0,brief:"Knowledge vault librarian"}],xe=[{id:"auto",label:"Auto",hint:"Agent picks retrieval"},{id:"hybrid",label:"Hybrid RAG",hint:"Dense + BM25 fusion"},{id:"graphrag",label:"GraphRAG",hint:"Knowledge graph communities"},{id:"vault",label:"Vault",hint:"World knowledge vault"},{id:"documents",label:"Documents",hint:"Ingested document store"}],et={dashboard:"Control center",chat:"Ask agent",agents:"Agent fleet",world:"Worlds",approvals:"Approvals",crm:"CRM & pipeline",outreach:"Outreach",goals:"Goals & tasks",memory:"Memory",documents:"Documents",history:"History",tools:"Tools",activity:"Activity",settings:"Settings"},tt=["prospect","contacted","replied","meeting","won","lost","nurture"],at=["prospect","contacted","responded","meeting_set","closed","dead"],st=["#f75440","#00666b","#03904a","#051f13","#5a403c","#8f706b","#e3beb8"],nt=15,ot=30,rt=5e3,it=3e4,lt=3e4,dt={aggregator:{label:"Aggregator",cls:"agent-role--aggregator",avatar:"agent-avatar--aggregator"},outreach:{label:"Outreach",cls:"agent-role--outreach",avatar:"agent-avatar--outreach"},leads:{label:"Leads",cls:"agent-role--leads",avatar:"agent-avatar--leads"},research:{label:"Intel",cls:"agent-role--research",avatar:"agent-avatar--research"},knowledge:{label:"Vault",cls:"agent-role--vault",avatar:"agent-avatar--knowledge"}},ct={supervisor:"SV",pulse:"PL",outreach:"OR",leads:"LD",market:"MK",vault:"VL"},ut={root:{label:"Main",cls:"world-kind--root"},project:{label:"Startup",cls:"world-kind--project"},startup:{label:"Startup",cls:"world-kind--project"},technical:{label:"Technical",cls:"world-kind--research"},idea:{label:"Idea",cls:"world-kind--idea"},research:{label:"Research",cls:"world-kind--research"}};function ce(e){Object.assign(e,{APP_NAME:Xe,DEFAULT_SPECIALISTS:Ze,RAG_MODES:xe,TITLES:et,CRM_STATUSES:tt,COMPANY_STATUSES:at,CHART_COLORS:st,MSG_READ_INITIAL_LINES:nt,MSG_READ_EXPAND_LINES:ot,LIVE_POLL_MS:rt,LIVE_POLL_HIDDEN_MS:it,REFRESH_MS:lt,AGENT_ROLES:dt,AGENT_INITIALS:ct,WORLD_KINDS:ut})}function ue(e){async function S(b,a,p="POST"){let u=await fetch("/api"+b,{method:p,body:a,credentials:"same-origin"}),m=await u.json().catch(()=>({}));if(u.status===401&&m.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!u.ok)throw new Error(m.error||u.statusText);return m}async function k(b,a={}){let p=new AbortController,u=a.timeoutMs??3e4,m=setTimeout(()=>p.abort(),u),{timeoutMs:o,headers:t,signal:s,...l}=a;try{let i=await fetch("/api"+b,{...l,credentials:"same-origin",headers:{"Content-Type":"application/json",...t||{}},signal:s||p.signal}),f=await i.json().catch(()=>({}));if(i.status===401&&f.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!i.ok)throw new Error(f.error||i.statusText);return f}catch(i){throw i.name==="AbortError"?new Error("Request timed out \u2014 is the server running?"):i}finally{clearTimeout(m)}}e.api=k,e.apiUpload=S}function pe(e){function S(){let k=localStorage.getItem("fos_selected_specialist");if(k!==null)return k;let b=localStorage.getItem("fos_selected_agent");return b&&b!=="supervisor"?b:""}e.state={live:{},selectedSpecialist:S(),ragMode:localStorage.getItem("fos_rag_mode")||"auto",activeWorldId:localStorage.getItem("fos_active_world")||"root",agentsTab:localStorage.getItem("fos_agents_tab")||"runs",expandedRunId:null,ui:{worldCreateOpen:!1,crmFormOpen:!1,goalsFormOpen:!1,reminderFormOpen:!1,vaultFacet:null,vaultDocForm:null,vaultDocEdit:null},_worldTemplates:null,_operations:{},_chatAttachments:[]},e.state._syncingLinkIds=new Set,e.currentView="dashboard",e.chatHistory=e.readJsonStorage("fos_chat",[]),e.historyTab=localStorage.getItem("fos_history_tab")||"conversations",e.documentsEditMode=!1,e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.livePollTimer=null,e._runtimePollTick=0,e.whatsappPollTimer=null,e.memoryGraphTab="graph",e.worldGraphTab="hierarchy",e.lastLiveActive=!1,e.viewDataLoadGen=0,e.vaultLoadGen=0,e.graphDrawCache={},e.actionBusyDepth=0,e.actionBusyButton=null,e.refreshTimer=null,e.loadSelectedSpecialist=S}function me(e){function S(){let l=e.state.config||{};return l.my_name?`${l.my_name}'s ${e.APP_NAME}`:e.APP_NAME}function k(){return e.state.activeWorldId||e.$("#world-select")?.value||"root"}function b(){let l=e.state.worlds||e.state._worldFull?.worlds||{},i=e.currentWorldId();return i==="root"?l.root?.name||"Main world":(l.children||[]).find(D=>D.id===i)?.name||i}function a(l){e.state.activeWorldId=l||"root",localStorage.setItem("fos_active_world",e.state.activeWorldId),e.populateWorldSelect(),e.updateWorldContextChrome()}function p(){let l=e.$("#world-select");if(!l)return;let i=e.state.activeWorldId||"root";[...l.options].some(f=>f.value===i)&&(l.value=i)}function u(){let l=e.activeWorldLabel();document.querySelectorAll("[data-active-world-label]").forEach(i=>{i.textContent=l}),e.syncWorldSelectValue(),e.currentView==="world"&&e.patchWorldTreeNav()}function m(){let l=e.$("#specialist-select-agents")?.value??e.state.selectedSpecialist??"";return l==="auto"?"":l||""}function o(){return e.$("#rag-mode-select")?.value||e.state.ragMode||"auto"}function t(){return!!e.currentSpecialistId()}function s(){let l=e.$("#world-select");if(!l)return;let i=e.state.worlds||e.state._worldFull?.worlds||{},f=i.root,D=i.children||[],I=D.map(y=>`<option value="${e.esc(y.id)}">${e.esc(y.name)} \xB7 ${e.esc(y.kind||"project")}</option>`).join("");l.innerHTML=`
      <optgroup label="Main">
        <option value="root">${e.esc(f?.name||"Main world")} \u2014 all context</option>
      </optgroup>
      ${D.length?`<optgroup label="Sub-worlds">${I}</optgroup>`:""}`;let v=e.state.activeWorldId||"root";[...l.options].some(y=>y.value===v)?l.value=v:(l.value="root",e.state.activeWorldId="root",localStorage.setItem("fos_active_world","root"))}e.ownerLabel=S,e.currentWorldId=k,e.activeWorldLabel=b,e.setActiveWorld=a,e.syncWorldSelectValue=p,e.updateWorldContextChrome=u,e.currentSpecialistId=m,e.currentRagMode=o,e.isDirectSpecialist=t,e.populateWorldSelect=s}function he(e){function S(t,s={}){e.state._viewLoading=!!t;let l=document.getElementById("global-progress"),i=l?.querySelector(".global-progress__bar");l&&(l.hidden=!t,l.setAttribute("aria-hidden",t?"false":"true"),t&&s.progress==null?(l.classList.add("is-indeterminate"),i&&(i.style.width="")):t&&s.progress!=null?(l.classList.remove("is-indeterminate"),i&&(i.style.width=`${Math.min(100,s.progress)}%`)):(l.classList.remove("is-indeterminate"),i&&(i.style.width="0")))}function k(t){e.actionBusyDepth++,e.actionBusyDepth===1&&(e.state._viewLoading||e.setViewLoading(!0),document.body.classList.add("is-action-busy"));let s=t?.closest?.("button, [role='button']")||t;s&&!e.actionBusyButton&&(e.actionBusyButton=s,s.classList.add("is-loading"),s.setAttribute("aria-busy","true"),"disabled"in s&&(s.disabled=!0))}function b(t){let s=t?.closest?.("button, [role='button']")||t;s&&e.actionBusyButton===s&&(s.classList.remove("is-loading"),s.removeAttribute("aria-busy"),"disabled"in s&&!s.dataset.keepDisabled&&(s.disabled=!1),e.actionBusyButton=null),e.actionBusyDepth=Math.max(0,e.actionBusyDepth-1),e.actionBusyDepth===0&&(e.state._viewLoading||e.setViewLoading(!1),document.body.classList.remove("is-action-busy"))}function a(t,s){e.beginActionBusy(s);try{let l=t();return l!=null&&typeof l.then=="function"?l.finally(()=>e.endActionBusy(s)):(e.endActionBusy(s),l)}catch(l){throw e.endActionBusy(s),l}}function p(t){return!t||t.id==="chat-send"||t.id==="chat-clear"||t.dataset.toggleUi!==void 0||t.dataset.goto!==void 0||t.dataset.toggleRun!==void 0||t.dataset.memoryTab!==void 0||t.dataset.vaultFacet!==void 0||t.dataset.vaultAddDoc!==void 0||t.dataset.vaultCancelDoc!==void 0||t.dataset.removeAttachment!==void 0||t.dataset.historyTab!==void 0||t.dataset.pickVaultDoc!==void 0||t.dataset.cancelEdit!==void 0||t.dataset.editWorld!==void 0||t.dataset.docsAction==="toggle"}function u(t="72%"){return`<span class="skeleton" style="display:block;height:12px;width:${t}"></span>`}function m(t=3){return`<div class="skeleton-card driver-card">${Array.from({length:t},(l,i)=>e.skeletonLine(i===0?"38%":"88%")).join("")}</div>`}function o(t){let s=`<div class="skeleton-grid">${e.skeletonCard(2)}${e.skeletonCard(2)}${e.skeletonCard(2)}</div>`;return t==="dashboard"?`<div class="view-skeleton dashboard-grid">${e.skeletonCard(2)}<div class="span-8">${e.skeletonCard(4)}</div><div class="span-4">${e.skeletonCard(2)}</div>${s}</div>`:t==="chat"?`<div class="view-skeleton"><div class="skeleton-card driver-card">${e.skeletonLine("30%")}${e.skeletonLine("60%")}</div><div class="skeleton-card driver-card" style="min-height:280px">${e.skeletonLine("100%")}${e.skeletonLine("92%")}${e.skeletonLine("78%")}</div></div>`:t==="world"?`<div class="view-skeleton dashboard-grid"><div class="span-4">${e.skeletonCard(3)}</div><div class="span-8">${e.skeletonCard(5)}</div>${s}</div>`:t==="documents"?`<div class="view-skeleton docs-workspace"><div class="skeleton-card driver-card">${e.skeletonCard(4)}</div><div class="skeleton-card driver-card">${e.skeletonCard(6)}</div></div>`:t==="outreach"?`<div class="view-skeleton">${e.skeletonCard(2)}${e.skeletonCard(4)}</div>`:`<div class="view-skeleton">${e.skeletonCard(3)}${s}</div>`}e.setViewLoading=S,e.beginActionBusy=k,e.endActionBusy=b,e.runWithActionBusy=a,e.shouldSkipActionBusy=p,e.skeletonLine=u,e.skeletonCard=m,e.renderViewSkeleton=o}function ge(e){function S(){e.state._worldVault=null,e.state._vaultGraph=null,e.state._vaultWorldId=null,e.state._vaultLoading=!1}function k(){return e.state._worldVault?.vault||e.state._worldVault||null}function b(s){return!!(s&&s!=="root"&&e.state._vaultWorldId===s&&e.vaultPayload())}function a(s,l=""){if(!s)return`${l}:empty`;let i=s.nodes||[],f=s.edges||[],D=s.meta||{},I=i.slice(0,12).map(v=>`${v.data?.id}:${v.data?.label}`).join("|");return`${l}:${i.length}:${f.length}:${D.updated||""}:${D.document_count||""}:${I}`}function p(...s){if(!s.length){Object.keys(e.graphDrawCache).forEach(l=>delete e.graphDrawCache[l]);return}s.forEach(l=>delete e.graphDrawCache[l])}function u(s,l,i={},f="Nothing to visualize yet."){if(!window.FOSGraph)return null;let D=document.getElementById(s);if(!D)return null;let I=D.parentElement?.querySelector(`[data-graph-placeholder-for="${s}"]`);I||(I=document.createElement("p"),I.className="graph-placeholder body-md muted",I.dataset.graphPlaceholderFor=s,D.insertAdjacentElement("afterend",I));let v=l?.nodes||[],y=l?.edges||[],O=v.length===1&&v[0]?.data?.type==="empty",P=v.length===1&&v[0]?.data?.type==="loading",G=v.length+y.length>0&&!O&&!P,J=e.graphDataSignature(l,`${s}:${i.layout?.name||"default"}:${i.onSelect?"interactive":"static"}`),z=null;return G?e.graphDrawCache[s]===J&&FOSGraph.getCy(s)&&!i.onSelect?z=FOSGraph.getCy(s):(z=FOSGraph.render(s,l,i),e.graphDrawCache[s]=J):(FOSGraph.destroy(s),delete e.graphDrawCache[s]),z?(D.classList.remove("is-empty"),I.hidden=!0):(D.classList.add("is-empty"),I.hidden=!1,I.textContent=P?v[0]?.data?.label||"Loading\u2026":f),z}function m(s){e.worldGraphTab=s,document.querySelectorAll("[data-world-graph-tab]").forEach(i=>{i.classList.toggle("is-active",i.dataset.worldGraphTab===s)});let l=document.getElementById("world-graph-legend");l&&(l.innerHTML=e.worldGraphLegendHtml(s)),e.drawGraphs()}async function o(){if(window.FOSGraph){try{window.FOSVendors&&await window.FOSVendors.ensure(["cytoscape"])}catch(s){console.warn("cytoscape load failed:",s);return}if(e.currentView==="dashboard"&&e.state._runtimeGraph&&e.renderGraphOrPlaceholder("graph-runtime-dash",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:20}},"Runtime graph appears when an agent is active."),e.currentView==="agents"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-agents")&&e.renderGraphOrPlaceholder("graph-runtime-agents",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="chat"&&e.state._runtimeGraph&&document.getElementById("graph-runtime-chat")&&e.renderGraphOrPlaceholder("graph-runtime-chat",e.state._runtimeGraph,{layout:{name:"breadthfirst",directed:!0,padding:16}},"Runtime graph appears when an agent is active."),e.currentView==="world"){let s=e.worldById(e.inspectorWorldId());if(e.worldGraphTab==="vault"&&!e.isRootWorld(s))e.renderGraphOrPlaceholder("graph-world",e.vaultGraphForWorld(s),{layout:FOSGraph.HIERARCHY_LAYOUT,onSelect:l=>{l.facet_id&&(e.state.ui={...e.state.ui||{},vaultFacet:l.facet_id},e.patchWorldPanels())}},"No files yet \u2014 add documents or link a GitHub repo in the knowledge panel below.");else{let l=e.worldGraphTab==="ecosystem"?e.state._worldGraph:e.state._worldHierarchyGraph||e.state._worldGraph;l?(e.renderGraphOrPlaceholder("graph-world",l,{layout:e.worldGraphTab==="hierarchy"?FOSGraph.HIERARCHY_LAYOUT:FOSGraph.LAYOUT,onSelect:i=>{i.world_id&&e.selectInspectorWorld(i.world_id)}},"World map will appear once your hierarchy is loaded."),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())):e.renderGraphOrPlaceholder("graph-world",null,{},"World map will appear once your hierarchy is loaded.")}}e.currentView==="memory"&&e.state._memoryGraph&&e.renderGraphOrPlaceholder("graph-memory",e.state._memoryGraph,{onSelect:s=>{let l=e.$("#graph-memory-detail");l&&(l.textContent=`${s.type}: ${s.label}`)}},"Memory graph fills in as you store knowledge and run agents.")}}async function t(){let s=e.currentView;if(["dashboard","agents","chat","world"].includes(s)&&!e.state._runtimeGraph)try{e.state._runtimeGraph=await e.api("/graph/runtime")}catch{e.state._runtimeGraph=null}if(s==="world"){if(!e.state._worldFull?.graph)try{let i=await e.api("/graph/world");e.state._worldGraph=i?.graph??null,e.state._worldHierarchyGraph=i?.hierarchy_graph??null,e.state._worldPreviews=i?.world_previews??{},e.state._worldFull=i,e.invalidateGraphCache("graph-world")}catch{}}else s==="dashboard"&&e.state._world&&(e.state._worldGraph=e.state._world.graph??e.state._worldGraph??null,e.state._world.worlds&&!e.state.worlds?.root&&(e.state.worlds=e.state._world.worlds));if(s==="memory"&&!e.state._memoryFull?.graph)try{let i=await e.api("/graph/memory");e.state._memoryGraph=i.graph??null,e.state._memoryFull=i,e.invalidateGraphCache("graph-memory")}catch{}}e.clearVaultScopedState=S,e.vaultPayload=k,e.vaultReadyFor=b,e.graphDataSignature=a,e.invalidateGraphCache=p,e.renderGraphOrPlaceholder=u,e.switchWorldGraphTab=m,e.drawGraphs=o,e.loadGraphData=t}function fe(e){function S(o,t="Waiting for activity\u2026"){return o?.length?`<div class="tool-flow">${o.map((s,l)=>{let i=l>0?'<span class="tool-flow-arrow" aria-hidden="true">\u2192</span>':"";if(s.type==="phase")return`${i}<span class="tool-flow-node">${e.esc(s.label)}</span>`;let f=s.decision==="approve"?" is-approve":s.decision==="deny"?" is-deny":"";return`${i}<span class="tool-flow-node${f}">${e.esc(s.name||s.label)}</span>`}).join("")}</div>`:`<p class="body-md muted">${e.esc(t)}</p>`}function k(o,t="live-panel"){let s=o?.jobs?.length?o.jobs:o?.active?[o]:[],l=s.some(v=>v.active||v.status==="running")||o?.active,i=s[0]||o||{},f=i.events||o?.events||[],D=f.map((v,y)=>`<option value="${y}"${y===f.length-1?" selected":""}>${e.esc(v.label||v.name||"Step")}</option>`).join(""),I=s.length?s.map(v=>`
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
      <p class="live-phase" id="${t}-phase">${e.esc(i.phase||o?.phase||"Idle \u2014 send a message or delegate a task")}</p>
      ${f.length?`<label class="live-phase-select"><span class="caption-uppercase">Step</span>
        <select class="world-select" id="${t}-step" aria-label="Current step">${D}</select></label>`:""}
      <div id="${t}-flow">${e.renderLiveFlow(f)}</div>
      ${I?`<div class="live-jobs">${I}</div>`:""}
      ${l&&o?.elapsed_s?`<p class="world-meta">${o.elapsed_s}s elapsed \xB7 ${e.esc(o.actor||i.specialist||"")}</p>`:""}
    </section>`}function b(o){let t=e.$("#live-strip"),s=e.$("#live-strip-text");if(!t)return;let l=!!o?.active;l!==e.lastLiveActive&&(FOSMotion?.pulseLiveStrip?.(l),e.lastLiveActive=l),s&&l&&(s.textContent=o.phase||"Agent working\u2026")}function a(o){e.state.live=o||{},e.updateLiveStrip(o),e.$$("[id$='-phase']").forEach(t=>{t.textContent=o?.phase||"Idle"}),e.$$("[id$='-flow']").forEach(t=>{t.innerHTML=e.renderLiveFlow(o?.events||[])}),e.$$(".live-panel").forEach(t=>t.classList.toggle("is-active",!!o?.active))}async function p(){try{let o=await e.api("/live",{timeoutMs:15e3});if(e.state.live=o,e.patchLiveUI(o),["dashboard","agents","chat"].includes(e.currentView)&&(o?.active||e._runtimePollTick++%4===0)){let s=e.graphDataSignature(e.state._runtimeGraph,"runtime");e.state._runtimeGraph=await e.api("/graph/runtime").catch(()=>e.state._runtimeGraph);let l=e.graphDataSignature(e.state._runtimeGraph,"runtime");s!==l&&(e.invalidateGraphCache("graph-runtime-dash","graph-runtime-agents","graph-runtime-chat"),e.drawGraphs())}}catch{}}function u(){e.stopLivePoll(),e._runtimePollTick=0,e.pollLive(),e.scheduleLivePoll()}function m(){e.livePollTimer&&(clearTimeout(e.livePollTimer),e.livePollTimer=null)}e.renderLiveFlow=S,e.renderLivePanel=k,e.updateLiveStrip=b,e.patchLiveUI=a,e.pollLive=p,e.startLivePoll=u,e.stopLivePoll=m}function be(e){function S(p){return e.state._syncingLinkIds.has(String(p))}function k(){let p=document.getElementById("ops-stack");if(!p)return;let u=Date.now(),m=Object.values(e.state._operations||{}).filter(o=>o.status==="running"||o.finishedAt&&u-o.finishedAt<8e3).slice(0,5);if(!m.length){p.innerHTML="",p.hidden=!0;return}p.hidden=!1,p.innerHTML=m.map(o=>{let t=Math.round((o.progress||0)*100),s=o.status==="running"?"is-running":o.status==="error"?"is-error":"is-done",l=o.status==="running"?"Working":o.status==="error"?"Failed":"Done";return`<div class="ops-card ${s}" data-op-id="${e.esc(o.id)}">
        <div class="ops-card__head">
          <span class="ops-card__title">${e.esc(o.title)}</span>
          <span class="ops-card__status">${l}</span>
        </div>
        <p class="ops-card__detail">${e.esc(o.detail||"")}</p>
        ${o.status==="running"?`<div class="ops-card__bar" role="progressbar" aria-valuenow="${t}" aria-valuemin="0" aria-valuemax="100"><span style="width:${t}%"></span></div>`:""}
      </div>`}).join("")}async function b(p,u,m={}){let o=p;e.state._operations[o]={id:o,title:u,detail:"Scanning repository\u2026",progress:0,status:"running"},m.linkId!=null&&e.state._syncingLinkIds.add(String(m.linkId)),e.renderOpsStack(),m.worldId&&e.currentView==="world"&&e.render();try{for(;;){let t=await e.api(`/sync-jobs/${encodeURIComponent(p)}/batch`,{method:"POST",body:JSON.stringify({batch_size:8}),timeoutMs:18e4}),s=e.state._operations[o];if(s&&(s.progress=t.progress||0,s.detail=t.message||`${t.imported||0} files imported`,s.status=t.status==="failed"?"error":t.done?"done":"running"),e.renderOpsStack(),t.done)break}}catch(t){let s=e.state._operations[o];throw s&&(s.status="error",s.detail=t.message||"Sync failed",s.finishedAt=Date.now()),e.renderOpsStack(),t}finally{let t=e.state._operations[o];t&&!t.finishedAt&&(t.finishedAt=Date.now()),m.linkId!=null&&e.state._syncingLinkIds.delete(String(m.linkId)),e.renderOpsStack();try{await e.refresh(),m.worldId&&await e.reloadVault(m.worldId,{force:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.patchAgentsVaultPanel(),e.updateBadges()}catch{}setTimeout(()=>{delete e.state._operations[o],e.renderOpsStack()},8e3)}}async function a(p){let u=await e.api(`/worlds/${encodeURIComponent(p)}/sync-jobs`).catch(()=>({jobs:[]}));for(let m of u.jobs||[])!m?.id||e.state._operations[m.id]||e.runGithubSyncJob(m.id,`Syncing ${m.full_name}`,{worldId:p,linkId:m.link_id}).catch(console.error)}e.isLinkSyncing=S,e.renderOpsStack=k,e.runGithubSyncJob=b,e.resumeActiveSyncJobs=a}function ve(e){function S(){e.mdEditorState={mode:null,artifactId:null,worldId:null,docId:null,editMode:!1},e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit"}async function k(p,u,m){let o=e.$("#md-editor-dialog");if(!(!o||!p||!u)){e.mdEditorState={mode:"vault",artifactId:null,worldId:p,docId:u,editMode:!1},e.$("#md-dialog-title").textContent=m||"Document",e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").hidden=!1,e.$("#md-dialog-mode").textContent="Edit",e.$("#md-dialog-preview").innerHTML="<p class='body-md muted'>Loading\u2026</p>",o.showModal();try{let s=(await e.api(`/worlds/${encodeURIComponent(p)}/vault/documents/${encodeURIComponent(u)}/content`,{timeoutMs:2e4})).content||"";e.$("#md-dialog-source").value=s;let l=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(l,s)}catch(t){e.$("#md-dialog-preview").innerHTML=`<p class="body-md" style="color:var(--color-warn)">${e.esc(t.message||"Could not load document")}</p>`}}}async function b(){let p=e.$("#md-dialog-source")?.value??"";if(e.mdEditorState.mode==="vault"&&e.mdEditorState.worldId&&e.mdEditorState.docId){await e.api(`/worlds/${encodeURIComponent(e.mdEditorState.worldId)}/vault/documents/${encodeURIComponent(e.mdEditorState.docId)}`,{method:"PATCH",body:JSON.stringify({content:p}),timeoutMs:15e3});let m=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(m,p),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit";return}if(!e.mdEditorState.artifactId)return;await e.api(`/artifacts/${e.mdEditorState.artifactId}/content`,{method:"PUT",body:JSON.stringify({content:p}),timeoutMs:15e3});let u=e.$("#md-dialog-preview");await window.FOSMarkdown?.renderInto?.(u,p),e.mdEditorState.editMode=!1,e.$("#md-dialog-source").hidden=!0,e.$("#md-dialog-preview").hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}function a(){e.$("#md-dialog-close")?.addEventListener("click",()=>{e.$("#md-editor-dialog")?.close(),e.resetMdEditorDialog()}),e.$("#md-dialog-mode")?.addEventListener("click",async()=>{if(e.mdEditorState.mode!=="vault"&&!e.mdEditorState.artifactId)return;e.mdEditorState.editMode=!e.mdEditorState.editMode;let p=e.$("#md-dialog-source"),u=e.$("#md-dialog-preview");if(e.mdEditorState.editMode)p.hidden=!1,u.hidden=!0,e.$("#md-dialog-save").hidden=!1,e.$("#md-dialog-mode").textContent="Preview";else{let m=p?.value??"";await window.FOSMarkdown?.renderInto?.(u,m),p.hidden=!0,u.hidden=!1,e.$("#md-dialog-save").hidden=!0,e.$("#md-dialog-mode").textContent="Edit"}}),e.$("#md-dialog-save")?.addEventListener("click",()=>e.saveMdEditor().catch(p=>alert(p.message)))}e.resetMdEditorDialog=S,e.openVaultDocViewer=k,e.saveMdEditor=b,e.initMdEditorDialog=a}function ye(e){function S(){let o=e.state._nudges||[];return o.length?`<section class="driver-card span-12 up-next-panel">
      <p class="caption-uppercase">Up next</p>
      <p class="body-md muted">Reminders, follow-ups, approvals, and vault prompts for your active world.</p>
      <ul class="up-next-list">${o.slice(0,8).map((s,l)=>`
      <li class="up-next-item${(s.priority||9)<=2?" is-urgent":""}">
        <div class="up-next-item__body">
          <p class="up-next-item__title">${e.esc(s.title)}</p>
          <p class="up-next-item__meta muted">${e.esc(s.body||"")}</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-nudge-index="${l}">Open</button>
      </li>`).join("")}</ul>
    </section>`:""}function k(o){let t=e.state._nudges?.[Number(o)];if(!t)return;if(t.kind==="vault_leads"&&t.meta?.doc_id){e.tagVaultDocInChat(t.meta.doc_id,t.meta.world_id,t.title,"");return}let s=t.action||"chat";if(s==="crm")return e.goView("crm");if(s==="goals")return e.goView("goals");if(s==="approvals")return e.goView("approvals");if(s==="documents")return e.goView("documents");if(s==="world")return e.goView("world");e.goView(s)}function b(o,t,s){let l=document.getElementById(o);if(!l)return;let i=l.closest(".chart-panel");if(!i)return;let f=i.querySelector(".chart-empty");f||(f=document.createElement("p"),f.className="chart-empty muted body-md",i.appendChild(f)),f.textContent=t,f.hidden=!s,l.hidden=s}function a(){let o=window.innerWidth<640,t=e.state._world?.tools_by_category||e.state.about?.tools_by_category||{},s=Object.entries(t).slice(0,o?5:8);s.length&&e.$("#chart-tools")?(e.chartPanelNote("chart-tools","",!1),FOSCharts.bar("chart-tools",s.map(([I])=>I),s.map(([,I])=>I),{colors:e.CHART_COLORS})):e.chartPanelNote("chart-tools","No tool data yet.",!0);let l=e.state.snapshot?.crm?.by_status||{},i=Object.entries(l).filter(([,I])=>I>0).map(([I,v])=>({label:I,value:v}));i.length&&e.$("#chart-crm")?(e.chartPanelNote("chart-crm","",!1),FOSCharts.donut("chart-crm",i,{centerLabel:"contacts",colors:e.CHART_COLORS})):e.chartPanelNote("chart-crm","No CRM contacts yet \u2014 add leads in Chat or CRM.",!0);let D=[...e.state.usage_history||[]].reverse().map(I=>I.llm_calls||I.calls||0);D.length&&e.$("#chart-usage")?(e.chartPanelNote("chart-usage","",!1),FOSCharts.spark("chart-usage",D)):e.chartPanelNote("chart-usage","No LLM usage in the last 7 days.",!0)}function p(){let o=e.state.config||{},t=e.state.snapshot?.approvals_pending||0,s=o.agent_paused;return`
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
          <button type="button" class="operator-card${t?" operator-card--alert":""}" data-operator="approvals">
            <span class="operator-card__title">Approvals${t?` (${t})`:""}</span>
            <span class="operator-card__desc">Review before agents act</span>
          </button>
        </div>
      </section>`}function u(o){if(e.state.ui||(e.state.ui={}),o==="create-world"){e.state.ui.worldCreateOpen=!0,e.currentView==="world"?(e.render(),requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"}))):(e.goView("world"),e.state._scrollWorldCreate=!0);return}if(o==="add-contact"){e.state.ui.crmFormOpen=!0,e.currentView==="crm"?e.render():e.goView("crm");return}if(o==="add-goal"){e.state.ui.goalsFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}if(o==="add-reminder"){e.state.ui.reminderFormOpen=!0,e.currentView==="goals"?e.render():e.goView("goals");return}o==="settings"&&e.goView("settings"),o==="approvals"&&e.goView("approvals")}function m(){let o=e.state.snapshot||{},t=o.crm||{},s=e.state.finance||{},l=e.state.usage||{},i=e.state.about||{},f=e.state.config||{},D=o.approvals_pending||0,I=s.set?`<span class="pill ${s.status==="healthy"?"ok":s.status==="warning"?"warn":"info"}">${e.esc(s.status)}</span>`:"",v=s.set?s.runway||(s.runway_months!=null?s.runway_months+" mo":"\u2014"):null,y=(e.state.goals||[]).slice(0,5).map(J=>`<li>${e.esc(J.title)}</li>`).join("")||"<li class='muted'>No active goals \u2014 add one in Goals or use Direct controls.</li>",O=D>0?`<div class="spec-cell race-position-cell"><dt>Approvals</dt><dd>${D}</dd></div>`:'<div class="spec-cell"><dt>Approvals</dt><dd>0</dd></div>',P=e.state.live||{},G=e.state._agents||{};return`<div class="dashboard-grid">
        ${e.renderUpNext()}
        ${e.renderOperatorPanel()}
        <section class="driver-card span-8">
          ${e.renderLivePanel(P)}
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">World state</p>
          <p class="world-meta" style="margin-top:var(--space-xxs)">Updated ${e.esc(o.ts||"now")}</p>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tools</dt><dd>${i.total_tools||0}</dd></div>
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
          <div class="activity-timeline">${(e.state.actions||[]).slice(0,8).map(J=>`<div class="activity-timeline__row"><span class="mono">${e.esc(J.tool_name)}</span><span class="muted">${e.esc((J.created_at||"").slice(11,19))}</span></div>`).join("")||"<p class='muted'>No tool actions yet</p>"}</div>
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">Specialist status</p>
          <div class="specialist-chips">${e.listSpecialists(G).map(J=>`<span class="specialist-chip${e.agentBusy(P,J.id)?" is-busy":""}">${e.esc(J.label)}</span>`).join("")}</div>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents" style="margin-top:var(--space-sm)">Open agents</button>
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Runway ${I}</p>
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
            <div class="spec-cell"><dt>Tasks open</dt><dd>${o.tasks_open||0}</dd></div>
            <div class="spec-cell"><dt>LLM today</dt><dd class="small">${l.llm_calls||0}</dd></div>
          </dl>
        </section>
      </div>`}e.renderUpNext=S,e.handleNudgeAction=k,e.chartPanelNote=b,e.drawDashboardCharts=a,e.renderOperatorPanel=p,e.openOperatorAction=u,e.renderDashboard=m}function we(e){function S(){return localStorage.getItem("fos_chat_session")||""}function k(C){C?localStorage.setItem("fos_chat_session",C):localStorage.removeItem("fos_chat_session")}function b(C){C?.session_id&&e.setChatSessionId(C.session_id)}async function a(){let C=e.chatSessionId();if(C)try{let r=await e.api(`/history/sessions/${C}`);r?.messages?.length&&(e.chatHistory=r.messages.map(c=>({role:c.role==="assistant"?"agent":c.role,text:c.content})),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)))}catch{}}function p(C={}){let r={world_id:e.currentWorldId(),rag_mode:e.currentRagMode(),session_id:e.chatSessionId()||void 0,specialist:e.currentSpecialistId()||void 0,...C},c=(e.state._chatAttachments||[]).filter($=>$?.doc_id);return c.length&&(r.attachments=c.map($=>({type:"vault",doc_id:$.doc_id,title:$.title,path:$.path}))),r}function u(C){if(C.pending)return`<div class="msg-pending"><span class="live-pulse" aria-hidden="true"></span> ${e.esc(C.pendingLabel||"Agent working\u2026")}</div>`;let r=C.text||"";if(C.role==="agent"||C.role==="assistant"){let c=window.FOSMarkdown?.render?.(r)||e.esc(r),$=(C.artifacts||[]).map(A=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${A.id}">${e.esc(A.title||A.kind||"Document")}</button>`).join("");return`<div class="msg-md">${c}</div>${$?`<div class="msg-artifacts">${$}</div>`:""}`}return`<div class="msg-plain">${e.esc(r)}</div>`}function m(C,r){return`msg:${C}:${e.chatSessionId()||"default"}:${r}`}function o(C){return C<=0?e.MSG_READ_INITIAL_LINES:C===1?e.MSG_READ_INITIAL_LINES+e.MSG_READ_EXPAND_LINES:1/0}function t(C){let r=C||document.getElementById("content");r&&(e.state._msgExpand||(e.state._msgExpand={}),r.querySelectorAll(".msg-read-more-host").forEach(c=>{let $=c.querySelector(":scope > .msg-md, :scope > .msg-plain"),A=c.querySelector(".msg-read-more");if(!$||!A)return;let E=c.dataset.msgScope||"chat",F=c.dataset.msgIndex??"0",q=e.msgExpandKey(E,F),Y=e.state._msgExpand[q]||0,te=parseFloat(getComputedStyle($).lineHeight)||21,h=Math.max(1,Math.round($.scrollHeight/te)),w=e.msgReadLineLimit(Y);if(A.dataset.msgReadMore=q,w>=h||Y>=2){$.classList.remove("msg-body--clamped"),$.style.maxHeight="",A.hidden=!0;return}$.classList.add("msg-body--clamped"),$.style.maxHeight=`${w*te}px`,A.hidden=!1,A.textContent="Read more"}))}function s(C){return C?.length?`<div class="msg-artifacts">${C.map(r=>`<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${r.id}">${e.esc(r.title||r.kind||"File")}</button>`).join("")}</div>`:""}async function l(){let C=e.currentWorldId(),r=C&&C!=="root"?`?world_id=${encodeURIComponent(C)}`:"";try{let c=await e.api(`/history${r}`,{timeoutMs:15e3});e.state._chatSessions=c.sessions||[]}catch{e.state._chatSessions=e.state._chatSessions||[]}}function i(){let C=e.state._chatSessions||[],r=e.chatSessionId();return`<section class="chat-sessions-strip driver-card">
      <div class="chat-sessions-strip__head">
        <p class="caption-uppercase">Chats</p>
        <button type="button" class="button-primary button-sm" data-new-chat-session>+ New</button>
      </div>
      <div class="chat-sessions-strip__list">${C.map($=>`
      <button type="button" class="chat-session-chip${$.id===r?" is-active":""}" data-chat-session="${e.esc($.id)}">
        <span class="chat-session-chip__title">${e.esc($.title||"Conversation")}</span>
        <span class="chat-session-chip__meta">${e.fmtHistoryTime($.updated_at)}</span>
      </button>`).join("")||"<span class='muted body-md'>No previous chats</span>"}</div>
    </section>`}async function f(C){e.openDocumentsWorkspace(C)}function D(){let C=e.state._chatAttachments||[];return C.length?`<div class="chat-attachments">${C.map((r,c)=>`<span class="chat-attachment-chip">
        <span>\u{1F4CE} ${e.esc(r.title||"File")}</span>
        <button type="button" class="chat-attachment-chip__remove" data-remove-attachment="${c}" aria-label="Remove attachment">\xD7</button>
      </span>`).join("")}</div>`:""}async function I(){let C=e.currentWorldId();if(!C||C==="root"){alert("Select a project world (not Main) to attach vault documents.");return}await e.ensureVaultForWorld(C);let r=e.vaultPayload()||{},c=r.facets||r.folders||[],$=[];for(let F of c)for(let q of F.documents||[])e.isMarkdownFilename(q.filename||q.github_path)&&$.push(q);let A=e.$("#vault-picker-list"),E=e.$("#vault-picker-dialog");!A||!E||(A.innerHTML=$.length?$.map(F=>`
      <button type="button" class="vault-picker-item" data-pick-vault-doc="${F.id}" data-world-id="${e.esc(C)}" data-doc-title="${e.esc(F.title)}" data-doc-path="${e.esc(F.github_path||F.filename||"")}">
        <strong>${e.esc(F.title)}</strong>
        <span class="muted">${e.esc(F.github_path||F.filename||"")}</span>
      </button>`).join(""):"<p class='body-md muted'>No markdown docs in vault \u2014 link and sync a GitHub repo in Worlds.</p>",E.showModal())}async function v(C){for(;;){let r=await e.api(`/chat/jobs/${encodeURIComponent(C)}`,{timeoutMs:2e4}),c=r.job;if(!c)break;if(e.state._activeJob=c,e.patchLiveUI(e.state.live),e.patchChatJobBubble(c),["completed","failed","cancelled"].includes(c.status))return{job:c,pending_approvals:r.pending_approvals};await e.sleep(1200)}return null}function y(C){let r=e.chatHistory.findIndex($=>$.jobId===C.id);if(r<0)return;C.status==="running"?(e.chatHistory[r].pending=!0,e.chatHistory[r].pendingLabel=C.phase||"Agent working\u2026"):(e.chatHistory[r].pending=!1,e.chatHistory[r].text=C.result||C.error||"(no response)",e.chatHistory[r].artifacts=C.artifacts||[],C.session_id&&e.setChatSessionId(C.session_id));let c=e.$("#chat-messages");c&&e.currentView==="chat"&&(c.innerHTML=e.renderChatMessagesInner(),window.FOSMarkdown?.enhance?.(c),e.initMsgReadMore(c),c.scrollTop=c.scrollHeight),e.updateLiveStrip({active:C.status==="running",phase:C.phase}),e.$$("#chat-live-panel-phase, [id$='-phase']").forEach($=>{$&&($.textContent=C.phase||"Idle")})}function O(){return e.chatHistory.length?e.chatHistory.map((r,c)=>r.pending?`<div class="msg ${r.role} is-pending"><div class="msg-bubble">${e.renderMessageHtml(r)}</div></div>`:`<div class="msg ${r.role}">
        <div class="msg-bubble msg-read-more-host" data-msg-scope="chat" data-msg-index="${c}">
          ${e.renderMessageHtml(r)}
          <button type="button" class="msg-read-more" hidden>Read more</button>
        </div>
      </div>`).join(""):""}async function P(C,{direct:r=!1,specId:c=""}={}){let $=e.chatPayload({message:C});r&&c&&($.specialist=c);let A=await e.api("/chat/async",{method:"POST",body:JSON.stringify($),timeoutMs:2e4});e.state._chatAttachments=[];let E=A.job;e.chatHistory.push({role:"agent",text:"",pending:!0,jobId:E.id,pendingLabel:E.phase||"Starting\u2026"}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.state._activeJob=E,e.render(),e.startLivePoll();try{let F=await e.pollAgentJob(E.id);F?.job?.session_id&&e.setChatSessionId(F.job.session_id),F?.pending_approvals&&(e.state.approvals=F.pending_approvals,e.updateBadges()),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),await e.loadChatSessionsList()}finally{e.state._activeJob=null,e.pollLive(),e.currentView==="chat"&&e.render()}}async function G(C){let r=C||e.state._activeJob?.id;if(r)try{await e.api(`/chat/jobs/${encodeURIComponent(r)}/cancel`,{method:"POST",timeoutMs:1e4}),e.state._activeJob?.id===r?await e.pollAgentJob(r):e.pollLive()}catch(c){alert(c.message)}}function J(){let C=e.state._agents||{},r=e.routingMeta(C),c=e.routingLabel(C),$=e.isDirectSpecialist(),A=e.listSpecialists(C),E=e.state.ragMode||"auto",F=e.RAG_MODES.find(L=>L.id===E)||e.RAG_MODES[0],q=e.renderChatMessagesInner(),Y=e.state.live||{},te=!e.chatHistory.length,h=!!e.state._activeJob?.active||e.chatHistory.some(L=>L.pending),w=e.collectAgentRuns().slice(0,4);return`<div class="chat-shell">
      <header class="chat-header driver-card">
        <div>
          <p class="section-eyebrow">Optional \xB7 agent assist</p>
          <h2 class="title-md">Ask agent</h2>
        </div>
        <div class="chat-header__meta">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          <span class="badge-pill agent-routing-badge">${e.esc(c)}</span>
          ${h?'<span class="badge-pill badge-pill--alert">Working</span>':""}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents">Change specialist</button>
        </div>
      </header>
      ${e.renderChatSessionsList()}
      <div class="chat-layout chat-layout--rich">
        <div class="chat-wrap">
          <div class="chat-messages${te?" is-empty":""}" id="chat-messages">
            ${te?`<div class="chat-empty">
              <p class="title-md">Supervisor ready</p>
              <p class="body-md">Routing: <strong>${e.esc(c)}</strong> \xB7 Retrieval: <strong>${e.esc(F.label)}</strong></p>
              <div class="capability-strip chat-empty__chips">
                <button type="button" class="delegate-hint" data-goto="crm">CRM</button>
                <button type="button" class="delegate-hint" data-goto="goals">Goals</button>
                <button type="button" class="delegate-hint" data-goto="world">Vault / Worlds</button>
                <button type="button" class="delegate-hint" data-goto="documents">Documents</button>
                <button type="button" class="delegate-hint" data-goto="agents">Agents</button>
              </div>
            </div>`:q}
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
              <textarea class="text-input-on-dark chat-input" id="chat-input" placeholder="${$?`Task for ${e.esc(r.label)}\u2026`:"Message supervisor\u2026"}" rows="3"${h?" disabled":""}></textarea>
              <button class="button-primary" id="chat-send"${h?" disabled":""}>${$?`Run ${e.esc(r.label)}`:"Send"}</button>
            </div>
            <div class="chat-toolbar">
              <label class="button-outline-on-dark button-sm upload-label">Upload<input type="file" id="chat-file" hidden accept=".pdf,.docx,.txt,.md,.csv,.json"></label>
              <button type="button" class="button-outline-on-dark button-sm" data-open-vault-picker>Attach vault</button>
              <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New chat</button>
              ${h?'<button type="button" class="button-outline-on-dark button-sm" data-cancel-active-job>Stop</button>':""}
              <button type="button" class="button-outline-on-dark button-sm" data-goto="world">Worlds</button>
            </div>
          </div>
          <section class="driver-card chat-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-chat" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </div>
        <aside class="chat-rail">
          ${e.renderLivePanel(Y,"chat-live-panel")}
          <section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Specialists</p>
            <div class="specialist-chips" style="margin-top:var(--space-xxs)">${A.map(L=>`<span class="specialist-chip${e.currentSpecialistId()===L.id?" is-selected":""}${e.agentBusy(Y,L.id)?" is-busy":""}">${e.esc(L.label)}</span>`).join("")}</div>
          </section>
          ${w.length?`<section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Recent runs</p>
            <div class="activity-timeline">${w.map(L=>`<div class="activity-timeline__row"><span>${e.esc((L.agent||"").toUpperCase())}</span><span class="muted">${e.esc((L.task||"").slice(0,40))}</span></div>`).join("")}</div>
          </section>`:""}
        </aside>
      </div>
    </div>`}function z(){requestAnimationFrame(()=>{let C=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),r=C?.[C.length-1];FOSMotion?.animateNewMessage?.(r)})}async function X(){try{await e.api("/auth/logout",{method:"POST",body:"{}"})}catch{}e.showPinGate()}async function ae(){let C=e.$("#chat-input"),r=(C?.value||"").trim();if(!r||e.chatHistory.some(q=>q.pending))return;let c=e.currentSpecialistId(),$=e.routingMeta(e.state._agents||{}),A=!!c;C.value="",e.chatHistory.push({role:"user",text:r}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render(),e.animateLatestChatMessage();let E=e.$("#chat-send"),F=A?`Run ${$.label}`:"Send";E&&(E.disabled=!0,E.textContent="\u2026");try{await e.startAgentJob(r,{direct:A,specId:c})}catch(q){e.chatHistory.push({role:"system",text:"Error: "+q.message}),localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),e.render()}E&&(E.disabled=!1,E.textContent=F),e.animateLatestChatMessage()}async function K(){let C=!e.state.config?.agent_paused;await e.api("/agent/pause",{method:"POST",body:JSON.stringify({paused:C})}),await e.refresh(),e.render()}e.chatSessionId=S,e.setChatSessionId=k,e.applyChatSessionResponse=b,e.loadChatFromServer=a,e.chatPayload=p,e.renderMessageHtml=u,e.msgExpandKey=m,e.msgReadLineLimit=o,e.initMsgReadMore=t,e.renderArtifactLinks=s,e.loadChatSessionsList=l,e.renderChatSessionsList=i,e.openMdEditor=f,e.renderChatAttachmentChips=D,e.openVaultAttachPicker=I,e.pollAgentJob=v,e.patchChatJobBubble=y,e.renderChatMessagesInner=O,e.startAgentJob=P,e.cancelActiveJob=G,e.renderChat=J,e.animateLatestChatMessage=z,e.logoutPin=X,e.sendChat=ae,e.togglePause=K}function _e(e){function S(t){t!=null&&(e.state._documentsSelectedId=Number(t)),e.goView("documents")}function k(){let t=e.state._artifacts||[],s=e.state._documentsSelectedId,l=t.find(v=>v.id===s),i=e.state._documentDraft??"",f=e.documentsEditMode,D=t.length?t.map(v=>`
      <button type="button" class="docs-list-item${v.id===s?" is-active":""}" data-select-document="${v.id}">
        <span class="badge-pill">${e.esc(v.kind||"md")}</span>
        <span class="docs-list-item__title">${e.esc(v.title||"Untitled")}</span>
        <span class="docs-list-item__meta muted">${e.fmtHistoryTime(v.created_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No documents yet. Create one or upload a file.</p>",I=`<div class="docs-empty">
      <p class="title-sm">Document workspace</p>
      <p class="body-md muted">Select a document from the list, or create a new markdown file.</p>
      <button type="button" class="button-primary button-sm" data-docs-action="new">+ New document</button>
    </div>`;return l&&(I=`
        <div class="docs-editor__toolbar">
          <input type="text" class="text-input-on-dark docs-title-input" id="docs-title-input" value="${e.esc(l.title||"Untitled")}" aria-label="Document title">
          <select class="text-input-on-dark field-select docs-world-select" id="docs-world-select" aria-label="Project">
            ${e.renderWorldOptionsForDocs(l.world_id||"root")}
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
          <div class="docs-list">${D}</div>
        </aside>
        <section class="driver-card docs-editor-panel">${I}</section>
      </div>`}async function b(){let t=prompt("Document title","Untitled");if(!t)return;let s=e.currentWorldId(),l=await e.api("/artifacts",{method:"POST",body:JSON.stringify({title:t,content:`# ${t}

`,world_id:s&&s!=="root"?s:null}),timeoutMs:15e3});e.state._documentsSelectedId=l.artifact?.id,e.documentsEditMode=!0,await e.loadViewData("documents"),e.render()}async function a(t){if(!t)return;let s=new FormData;s.append("file",t);let l=e.currentWorldId();l&&l!=="root"&&s.append("world_id",l);let i=await e.apiUpload("/artifacts",s);e.state._documentsSelectedId=i.artifact?.id,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function p(){let t=e.state._documentsSelectedId;if(!t)return;let s=document.getElementById("docs-source")?.value??e.state._documentDraft??"",l=document.getElementById("docs-title-input")?.value??"Untitled",i=document.getElementById("docs-world-select")?.value??"root";await e.api(`/artifacts/${t}/content`,{method:"PUT",body:JSON.stringify({content:s}),timeoutMs:15e3}),await e.api(`/artifacts/${t}`,{method:"PATCH",body:JSON.stringify({title:l,world_id:i==="root"?null:i}),timeoutMs:15e3}),e.state._documentDraft=s,e.documentsEditMode=!1,await e.loadViewData("documents"),e.render()}async function u(){let t=e.state._documentsSelectedId;if(!t)return;e.documentsEditMode&&await e.saveCurrentDocument();let s=await e.api(`/artifacts/${t}/memory`,{method:"POST",body:"{}",timeoutMs:2e4});alert(`Saved to memory (${s.collection||"documents"}).`)}async function m(t){e.state._documentsSelectedId=Number(t),e.documentsEditMode=!1;try{let s=await e.api(`/artifacts/${t}/content`,{timeoutMs:15e3});e.state._documentDraft=s.content||""}catch(s){e.state._documentDraft="",alert(s.message||"Could not load document")}e.render()}function o(t){let s=(t||"").toLowerCase();return s.endsWith(".md")||s.endsWith(".markdown")||s.endsWith(".rst")}e.openDocumentsWorkspace=S,e.renderDocuments=k,e.createNewDocument=b,e.uploadDocumentFile=a,e.saveCurrentDocument=p,e.saveDocumentToMemory=u,e.selectDocument=m,e.isMarkdownFilename=o}function $e(e){function S(r){let c=r?.supervisor||{};return{id:"supervisor",label:"Supervisor",role:"aggregator",tool_count:r?.total_tools,brief:c.role||"Orchestrates specialists \u2014 picks who to run when routing is Auto"}}function k(r){let c=r?.specialists||[];return(c.length?c:e.DEFAULT_SPECIALISTS).map(A=>({...A,label:A.label||A.id}))}function b(){let r=e.listSpecialists(e.state._agents||{}),c=e.state.selectedSpecialist??"";c&&!r.some(q=>q.id===c)&&(c=""),e.state.selectedSpecialist=c;let A=`<option value="">Auto \u2014 supervisor decides</option>${r.map(q=>`<option value="${e.esc(q.id)}">${e.esc(q.label)}</option>`).join("")}`,E=e.$("#specialist-select-agents");E&&(E.innerHTML=A,E.value=c);let F=e.$("#chat-specialist-select");F&&(F.innerHTML=A,F.value=c)}function a(r){let c=e.currentSpecialistId();return c?`Supervisor \u2192 ${e.listSpecialists(r||e.state._agents||{}).find(A=>A.id===c)?.label||c}`:"Supervisor \xB7 auto-route"}function p(r){let c=e.state._agents||r||{},$=e.currentSpecialistId();return $?e.listSpecialists(c).find(A=>A.id===$)||{id:$,label:$,role:"specialist"}:e.supervisorMeta(c)}function u(r,c){let $=r?.jobs||[],A=String(c||"");if($.some(F=>F.status==="running"&&(F.specialist===A||A==="supervisor"&&F.mode==="chat")))return!0;let E=r?.active?String(r.actor||""):"";return A==="supervisor"?E==="user":E===`subagent:${A}`||A&&E.includes(A)}function m(r){let c=e.AGENT_ROLES[r]||{label:r||"Specialist",cls:""};return`<span class="agent-role-badge ${c.cls}">${e.esc(c.label)}</span>`}function o(r,c){let $=e.AGENT_ROLES[c]||e.AGENT_ROLES.aggregator,A=e.AGENT_INITIALS[r]||(r||"??").slice(0,2).toUpperCase();return`<span class="agent-avatar ${$.avatar||"agent-avatar--aggregator"}" aria-hidden="true">${e.esc(A)}</span>`}function t(r,c){let $=(c||[]).find(E=>E.agent===r);return $?.ts?new Date(typeof $.ts=="number"&&$.ts<1e12?$.ts*1e3:$.ts).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function s(){let r=e.state._agentRunsApi||[],$=[...e.readJsonStorage("fos_agent_runs",[])];for(let A of r)$.some(E=>E.id===A.id)||$.push({...A,source:"trace"});return $.sort((A,E)=>(E.ts||0)-(A.ts||0)),$.slice(0,50)}function l(r){let c=e.readJsonStorage("fos_agent_runs",[]);c.unshift(r),localStorage.setItem("fos_agent_runs",JSON.stringify(c.slice(0,50)))}function i(r){let c=!e.currentSpecialistId();return`<button type="button" class="fleet-card fleet-card--auto${c?" is-selected":""}" data-select-specialist="" aria-pressed="${c}">
      ${c?'<span class="fleet-card__active-label">Routing</span>':""}
      <div class="fleet-card__top">
        <span class="agent-avatar agent-avatar--aggregator" aria-hidden="true">AU</span>
        <span class="fleet-card__status" title="Supervisor routes"></span>
      </div>
      <div class="fleet-card__name">Auto</div>
      <span class="agent-role-badge agent-role--aggregator">Supervisor picks</span>
      <div class="fleet-card__meta"><span>Default routing</span></div>
    </button>`}function f(r,c){let $=e.supervisorMeta(r),A=e.agentBusy(c,"supervisor");return`<div class="supervisor-banner driver-card">
      <div class="agent-card-title-row">
        ${e.agentAvatar("supervisor",$.role)}
        <div>
          <h2 class="title-md">${e.esc($.label)} <span class="supervisor-main-tag">Main agent</span></h2>
          <p class="world-meta">${e.esc(($.brief||"").slice(0,140))}</p>
        </div>
      </div>
      <span class="agent-status ${A?"busy":"ready"}">${A?"Working":"Always on"}</span>
    </div>`}function D(r,c,$,A){let E=e.agentBusy(c,r.id),F=$===r.id,q=e.lastRunForAgent(r.id,A);return`<button type="button" class="fleet-card${E?" is-busy":""}${F?" is-selected":""}" data-select-specialist="${e.esc(r.id)}" aria-pressed="${F}">
      ${F?'<span class="fleet-card__active-label">Direct</span>':""}
      <div class="fleet-card__top">
        ${e.agentAvatar(r.id,r.role)}
        <span class="fleet-card__status ${E?"is-busy":""}" title="${E?"Working":"Idle"}"></span>
      </div>
      <div class="fleet-card__name">${e.esc(r.label)}</div>
      ${r.role?e.agentRoleBadge(r.role):""}
      <p class="fleet-card__brief">${e.esc((r.brief||"").slice(0,72))}</p>
      <div class="fleet-card__meta">
        <span>${r.tool_count??"\u2014"} tools</span>
        ${q?`<span>${e.esc(q)}</span>`:""}
      </div>
    </button>`}function I(r,c,$=!1){let A=e.listSpecialists(r),E=e.currentSpecialistId(),F=e.collectAgentRuns();return $?`<div class="fleet-rail">${e.renderFleetAutoCard(c)}${A.map(q=>e.renderFleetCard(q,c,E,F)).join("")}</div>`:`<div class="agent-grid">${A.map(q=>{let Y={...q,label:q.label||q.id};return`<article class="agent-card${e.agentBusy(c,q.id)?" is-busy":""}">
          <div class="agent-card-head">${e.renderFleetCardInner(Y,c,F)}</div>
        </article>`}).join("")}</div>`}function v(r,c,$){let A=e.agentBusy(c,r.id),E=e.lastRunForAgent(r.id,$);return`
      <div class="agent-card-title-row">
        ${e.agentAvatar(r.id,r.role)}
        <div><h3>${e.esc(r.label)}</h3>${r.role?e.agentRoleBadge(r.role):""}</div>
      </div>
      <span class="agent-status ${A?"busy":"ready"}">${A?"Working":"Ready"}</span>
      <p class="agent-meta">${r.tool_count??0} tools${E?` \xB7 ${e.esc(E)}`:""}</p>`}function y(r){return r.length?`<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Time</th><th>Agent</th><th>Task</th><th>Duration</th><th>Tools</th><th></th></tr></thead>
      <tbody>${r.map(c=>{let $=c.ts?e.fmtTime(c.ts):"\u2014",A=(c.tools||[]).slice(0,4).join(", "),E=e.state.expandedRunId===c.id;return`<tr class="data-row${E?" is-expanded":""}" data-run-id="${e.esc(c.id)}">
          <td class="mono muted">${e.esc($)}</td>
          <td><span class="fleet-inline-badge">${e.esc((c.agent||"").toUpperCase())}</span></td>
          <td class="task-cell">${e.esc((c.task||"").slice(0,120))}</td>
          <td class="mono">${c.duration_s?`${c.duration_s}s`:"\u2014"}</td>
          <td class="muted">${e.esc(A||"\u2014")}</td>
          <td><button type="button" class="button-tertiary-text button-sm" data-toggle-run="${e.esc(c.id)}">${E?"Hide":"View"}</button></td>
        </tr>
        ${E?`<tr class="data-row-detail"><td colspan="6"><pre class="run-result mono">${e.esc(c.result||"No output recorded")}</pre></td></tr>`:""}`}).join("")}</tbody>
    </table></div>`:'<div class="empty-state"><p class="title-sm">No specialist runs yet</p></div>'}function O(){let r=e.state._tools||{},c=r.by_category||{};return`<div class="console-split">
      <div class="driver-card">${Object.entries(c).sort((A,E)=>E[1]-A[1]).map(([A,E])=>`<div class="kv-row"><span class="k">${e.esc(A)}</span><span class="v">${E}</span></div>`).join("")||"<p class='muted'>No tools loaded</p>"}</div>
      <div class="driver-card tool-list-compact">${(r.tools||[]).slice(0,24).map(A=>`<div class="tool-chip">${e.esc(A.name)}${A.requires_approval?'<span class="badge-pill">approval</span>':""}</div>`).join("")}</div>
    </div>`}function P(){let r=e.state._crm||{},c=r.pipeline||{},$=r.contacts||[],A=r.followups_due||[],E=Object.entries(c).map(([Y,te])=>`<div class="kv-row"><span class="k">${e.esc(Y)}</span><span class="v">${te}</span></div>`).join(""),F=A.slice(0,8).map(Y=>`<li>${e.esc(Y.name)} <span class="muted">${e.esc(Y.company||"")}</span></li>`).join("")||"<li class='muted'>None due</li>",q=$.slice(0,10).map(Y=>`<tr><td>${e.esc(Y.name)}</td><td>${e.esc(Y.company||"\u2014")}</td><td>${e.esc(Y.status||"\u2014")}</td></tr>`).join("");return`<div class="console-split">
      <section class="driver-card"><p class="caption-uppercase">Pipeline</p>${E||"<p class='muted'>Empty</p>"}
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Follow-ups due</p><ul class="list-plain">${F}</ul></section>
      <section class="driver-card"><p class="caption-uppercase">Contacts (${$.length})</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Company</th><th>Status</th></tr></thead>
        <tbody>${q||"<tr><td colspan='3' class='muted'>No contacts</td></tr>"}</tbody></table></div>
        <button type="button" class="button-outline-on-dark button-sm" data-goto="crm" style="margin-top:var(--space-xs)">Open CRM</button>
      </section>
    </div>`}function G(){let r=e.currentWorldId(),c=e.vaultReadyFor(r)?e.vaultPayload()||{}:{},$=c.folders||c.facets||[],A=e.state._agentsVaultQ||"",E=r!=="root"&&!e.vaultReadyFor(r);return`<div class="console-split">
      <section class="driver-card">
        <p class="caption-uppercase">Vault \xB7 ${e.esc(e.activeWorldLabel())}</p>
        ${E?"<p class='body-md muted' style='margin-top:var(--space-xs)'>Loading vault registry\u2026</p>":`<div class="vault-facet-grid" style="margin-top:var(--space-xs)">${$.map(F=>`<div class="vault-facet-card"><div class="vault-facet-head"><h4>${e.esc(F.domain_label||F.label||F.folder||"")}</h4><span class="badge-pill">${F.file_count??0} files</span></div></div>`).join("")||"<p class='muted'>Select a sub-world or link a repo in Worlds</p>"}</div>`}
        <button type="button" class="button-outline-on-dark button-sm" data-goto="world" style="margin-top:var(--space-sm)">Manage vault</button>
      </section>
      <section class="driver-card">
        <div class="search-row">
          <input type="search" class="text-input-on-dark" id="agents-vault-q" placeholder="Search vault\u2026" value="${e.esc(A)}">
          <button type="button" class="button-primary button-sm" id="agents-vault-search">Search</button>
        </div>
        <pre class="run-result mono" id="agents-vault-results" hidden></pre>
      </section>
    </div>`}function J(){let r=e.state.agentsTab||"runs",c=e.collectAgentRuns();if(r==="runs")return e.renderAgentRunsTable(c);if(r==="live"){let $=e.state.live||{};return e.renderLivePanel($,"agents-tab-live")}return r==="tools"?e.renderAgentsToolsPanel():r==="crm"?e.renderAgentsCrmPanel():r==="vault"?e.renderAgentsVaultPanel():""}function z(){let r=e.state._agents||{},c=e.state.live||r.live||{},$=e.routingMeta(r),A=e.routingLabel(r),E=e.isDirectSpecialist(),F=e.state._delegateDraft||"",q=e.collectAgentRuns(),Y=(e.state.approvals||[]).length,te=(r.specialists||[]).filter(j=>e.agentBusy(c,j.id)).length,h=r.skills||[],w=e.state.agentsTab||"runs",L=!!(e.state._delegateResult||"").trim(),M=e.state._agentActions||[];return`<div class="agents-console">
      <header class="console-toolbar driver-card">
        <div class="console-kpis">
          <div class="console-kpi"><span class="console-kpi__val">${r.specialists?.length||5}</span><span class="console-kpi__lbl">Specialists</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${te||"0"}</span><span class="console-kpi__lbl">Active</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${q.length}</span><span class="console-kpi__lbl">Runs</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${r.total_tools||0}</span><span class="console-kpi__lbl">Tools</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${Y}</span><span class="console-kpi__lbl">Approvals</span></div>
        </div>
        <div class="console-toolbar__actions">
          <span class="badge-pill" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          ${h.map(j=>`<span class="skill-chip${j.installed?"":" is-missing"}">${e.esc(j.name)}</span>`).join("")}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="approvals"${Y?"":" disabled"}>Approvals${Y?` (${Y})`:""}</button>
        </div>
      </header>
  
      ${e.renderSupervisorBanner(r,c)}
  
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
          <span class="badge-pill agent-routing-badge">${e.esc(A)}</span>
        </div>
        <div class="agent-picker-bar__cards">${e.renderAgentCards(r,c,!0)}</div>
      </section>
  
      <div class="agents-workspace">
        <section class="task-composer driver-card">
          <div class="task-composer__head">
            <div class="agent-card-title-row">
              ${e.agentAvatar(E?$.id:"supervisor",E?$.role:"aggregator")}
              <div>
                <h2 class="title-md">${E?e.esc($.label):"Supervisor"}</h2>
                <p class="world-meta">${E?e.esc(($.brief||"").slice(0,100)):"Auto-route \u2014 supervisor will delegate to the best specialist"}</p>
              </div>
            </div>
            <span class="agent-status ${e.agentBusy(c,E?$.id:"supervisor")?"busy":"ready"}">${e.esc(A)}</span>
          </div>
          <textarea class="text-input-on-dark task-composer__input" id="delegate-selected" rows="3" placeholder="${E?`Task for ${e.esc($.label)}\u2026`:"Message supervisor\u2026"}">${e.esc(F)}</textarea>
          <div class="task-composer__foot">
            <button type="button" class="button-primary" id="delegate-selected-btn">${E?`Run ${e.esc($.label)}`:"Send to supervisor"}</button>
            <span class="world-meta mono" data-active-world-label>${e.esc(e.activeWorldLabel())}</span>
          </div>
          ${L?`<div class="delegate-result-wrap msg-read-more-host driver-card" data-msg-scope="agents-delegate" data-msg-index="0">
            <div class="msg-md delegate-result-body">${window.FOSMarkdown?.render?.(e.state._delegateResult||"")||e.esc(e.state._delegateResult||"")}</div>
            <button type="button" class="msg-read-more" hidden>Read more</button>
          </div>`:""}
          <section class="driver-card chat-runtime-panel agents-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-agents" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </section>
  
        <aside class="agents-rail driver-card">
          ${e.renderLivePanel(c,"agents-live-panel")}
          <p class="caption-uppercase" style="margin-top:var(--space-sm)">Recent actions</p>
          <div class="action-feed">${M.slice(0,8).map(j=>`<div class="action-feed__item"><span class="mono">${e.esc(j.tool_name)}</span><span class="muted">${e.esc((j.created_at||"").slice(11,16))}</span></div>`).join("")||"<p class='muted'>No actions yet</p>"}</div>
        </aside>
      </div>
  
      <section class="driver-card agents-panel">
        <div class="workspace-tabs">
          <button type="button" class="workspace-tab${w==="runs"?" is-active":""}" data-agents-tab="runs">Run history</button>
          <button type="button" class="workspace-tab${w==="live"?" is-active":""}" data-agents-tab="live">Live runtime</button>
          <button type="button" class="workspace-tab${w==="tools"?" is-active":""}" data-agents-tab="tools">Tools</button>
          <button type="button" class="workspace-tab${w==="crm"?" is-active":""}" data-agents-tab="crm">CRM</button>
          <button type="button" class="workspace-tab${w==="vault"?" is-active":""}" data-agents-tab="vault">Vault</button>
        </div>
        <div class="agents-tab-body">${e.renderAgentsTabPanel()}</div>
      </section>
    </div>`}function X(){if(e.currentView!=="agents"||e.state.agentsTab!=="vault")return;let r=document.querySelector(".agents-console .console-split");r&&(r.outerHTML=e.renderAgentsVaultPanel())}function ae(r){let c=r||"";e.state.selectedSpecialist=c,localStorage.setItem("fos_selected_specialist",c),e.populateSpecialistSelect(),e.render()}async function K(){let r=e.$("#agents-vault-q")?.value?.trim();e.state._agentsVaultQ=r;let c=e.$("#agents-vault-results"),$=e.currentWorldId();if(!(!r||!$||$==="root"))try{let E=((await e.api(`/vault/search?${new URLSearchParams({q:r,world_id:$})}`)).hits||[]).map(F=>`[${F.metadata?.domain||"?"}] ${F.metadata?.source||""}
${(F.text||"").slice(0,240)}`).join(`

---

`)||"No hits.";c&&(c.textContent=E,c.hidden=!1)}catch(A){c&&(c.textContent=A.message,c.hidden=!1)}}async function C(){let r=e.currentSpecialistId(),c=e.$("#delegate-selected"),$=(c?.value||"").trim();if(!$)return;let A=e.$("#delegate-selected-btn"),E=e.routingMeta(e.state._agents||{}),F=!!r,q=Date.now();A&&(A.disabled=!0,A.textContent="Running\u2026"),e.startLivePoll(),e.state.agentsTab="live",localStorage.setItem("fos_agents_tab","live"),e.state._delegateResult="Agent working\u2026",e.render();try{let Y=await e.api("/chat/async",{method:"POST",body:JSON.stringify(e.chatPayload({message:$,specialist:F?r:void 0})),timeoutMs:2e4}),te=await e.pollAgentJob(Y.job.id),h=te?.job,w=h?.result||h?.error||"(no response)";e.state._delegateResult=w,e.state._delegateDraft="",c&&(c.value=""),h?.session_id&&e.setChatSessionId(h.session_id),e.persistAgentRun({id:h?.run_id||`local-${q}`,agent:F?r:"supervisor",task:$,result:w,duration_s:h?.elapsed_s||Math.round((Date.now()-q)/1e3),ts:Math.floor(q/1e3),tools:(h?.events||[]).filter(L=>L.name).map(L=>L.name),source:"delegate",artifacts:h?.artifacts}),e.state.agentsTab="runs",localStorage.setItem("fos_agents_tab","runs"),e.state.expandedRunId=h?.run_id||`local-${q}`,te?.pending_approvals&&(e.state.approvals=te.pending_approvals,e.updateBadges())}catch(Y){e.state._delegateResult="Error: "+Y.message}A&&(A.disabled=!1,A.textContent=F?`Run ${E.label}`:"Send to supervisor");try{let Y=await e.api("/agents/runs");e.state._agentRunsApi=Y.runs||[],e.state._agentActions=Y.actions||[]}catch{}e.state._activeJob=null,e.pollLive(),e.render(),e.drawGraphs()}e.supervisorMeta=S,e.listSpecialists=k,e.populateSpecialistSelect=b,e.routingLabel=a,e.routingMeta=p,e.agentBusy=u,e.agentRoleBadge=m,e.agentAvatar=o,e.lastRunForAgent=t,e.collectAgentRuns=s,e.persistAgentRun=l,e.renderFleetAutoCard=i,e.renderSupervisorBanner=f,e.renderFleetCard=D,e.renderAgentCards=I,e.renderFleetCardInner=v,e.renderAgentRunsTable=y,e.renderAgentsToolsPanel=O,e.renderAgentsCrmPanel=P,e.renderAgentsVaultPanel=G,e.renderAgentsTabPanel=J,e.renderAgents=z,e.patchAgentsVaultPanel=X,e.selectSpecialist=ae,e.agentsVaultSearch=K,e.delegateAgent=C}function Se(e){function S(n){let d=e.state.worlds||e.state._worldFull?.worlds||{},g=d.root,_=d.children||[],R=n||"",N=`<option value="root"${R==="root"||!R?" selected":""}>${e.esc(g?.name||"Main world")}</option>`;return N+=_.map(B=>`<option value="${e.esc(B.id)}"${R===B.id?" selected":""}>${e.esc(B.name)} \xB7 ${e.esc(B.kind||"project")}</option>`).join(""),N}function k(n,d){let g=n?.facets||n?.folders||[],_=[];for(let R of g)for(let N of R.documents||[])N.github_repo===d&&_.push(N);return _.sort((R,N)=>(R.github_path||R.filename||"").localeCompare(N.github_path||N.filename||""))}function b(n){let d=n.filter(g=>{let _=g.github_path||g.filename||"";return/^readme\.md$/i.test(_.split("/").pop()||"")});return d.length?d.sort((g,_)=>(g.github_path||g.filename||"").length-(_.github_path||_.filename||"").length)[0]:null}function a(n){let d=(n.files||[]).length;for(let g of Object.keys(n.dirs||{}))d+=e.countGithubTreeFiles(n.dirs[g]);return d}function p(n,d,g=0){let _=Object.keys(n.dirs||{}).sort(),R=(n.files||[]).sort((B,H)=>B._fileName.localeCompare(H._fileName)),N="";for(let B of _){let H=n.dirs[B],V=e.countGithubTreeFiles(H);N+=`<details class="github-tree-dir"${g<2?" open":""}>
        <summary><span class="mono">${e.esc(B)}</span> <span class="muted">${V} file${V!==1?"s":""}</span></summary>
        <div class="github-tree">${e.renderGithubTreeNode(H,d,g+1)}</div>
      </details>`}for(let B of R){let H=B.github_path||B.filename||B.title,V=/^readme\.md$/i.test((H||"").split("/").pop()||"");N+=`<div class="github-tree-file">
        <span class="github-tree-file__path mono${V?" is-readme":""}">${e.esc(H)}</span>
        <span class="github-tree-file__actions">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-view-doc="${B.id}" data-world-id="${e.esc(d)}" data-doc-title="${e.esc(B.title||H)}">View</button>
          <button type="button" class="button-primary button-sm" data-tag-vault-doc="${B.id}" data-world-id="${e.esc(d)}" data-doc-title="${e.esc(B.title||H)}" data-doc-path="${e.esc(H)}">Tag in agent</button>
        </span>
      </div>`}return N}function u(n,d,g,_){e.state._chatAttachments||(e.state._chatAttachments=[]);let R=Number(n);e.state._chatAttachments.some(N=>N.doc_id===R)||e.state._chatAttachments.push({type:"vault",doc_id:R,title:g||_||"Document",path:_||"",world_id:d}),e.goView("chat")}function m(n,d){if(n?.nodes&&n?.edges)return n;let g=n?.vault||n||{},_=d||{},R=[],N=[],B=_.id||g.world_id||"world",H=`vault-world:${B}`;return R.push({data:{id:H,label:(_.name||"World").slice(0,36),type:"world_root",world_id:B}}),(g.facets||g.folders||[]).forEach(W=>{let Q=W.id||W.folder||"slot",T=`vault-facet:${B}:${Q}`,ee=`${W.label||W.folder||"Folder"} (${W.file_count||0})`;R.push({data:{id:T,label:ee.slice(0,40),type:"vault_facet",facet_id:Q,folder:W.folder}}),N.push({data:{source:H,target:T,label:"folder"}}),(W.documents||[]).slice(0,14).forEach((Z,x)=>{let se=`vault-doc:${Z.id||x}`;R.push({data:{id:se,label:(Z.title||Z.filename||"Document").slice(0,36),type:"vault_file",doc_id:Z.id,facet_id:Q,source:Z.source_type||"upload"}}),N.push({data:{source:T,target:se,label:"doc"}})}),(W.files||[]).slice(0,8).forEach((Z,x)=>{let se=`vault-disk:${B}:${Q}:${x}`;R.push({data:{id:se,label:(Z.name||Z.relative||"file").slice(0,32),type:"vault_file",path:Z.relative,facet_id:Q,source:"disk"}}),N.push({data:{source:T,target:se,label:"disk"}})})}),(g.github_repos||[]).slice(0,10).forEach(W=>{let Q=`gh-repo:${W.id}`;R.push({data:{id:Q,label:(W.full_name||"repo").split("/").pop().slice(0,28),type:"vault_repo",link_id:W.id,repo:W.full_name}}),N.push({data:{source:H,target:Q,label:"github"}})}),R.length<=1&&(R.push({data:{id:"vault-empty",label:"Add docs or link GitHub",type:"empty"}}),N.push({data:{source:H,target:"vault-empty",label:"start"}})),{nodes:R,edges:N}}function o(n){let d=n?.id;if(!d||d==="root")return{nodes:[],edges:[]};if(e.state._vaultLoading&&e.state._vaultWorldId!==d)return{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]};if(e.state._vaultWorldId===d&&e.state._vaultGraph?.nodes?.length)return e.state._vaultGraph;let g=e.vaultReadyFor(d)?e.vaultPayload():null;return g?e.buildVaultGraph(g,n):e.state._vaultLoading?{nodes:[{data:{id:"vault-loading",label:"Loading vault\u2026",type:"loading"}}],edges:[]}:{nodes:[{data:{id:"vault-empty",label:"Vault not loaded",type:"empty"}}],edges:[]}}function t(n){return n==="vault"?`
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
      </form>`}function l(n){let d=e.worldTreeData(),g=n||"root";return g==="root"||g===d.root?.id?d.root||null:(d.children||[]).find(_=>_.id===g)||null}function i(){return e.state.inspectorWorldId||e.currentWorldId()||"root"}async function f(n,{force:d=!1}={}){if(!n||n==="root"){e.clearVaultScopedState(),e.invalidateGraphCache("graph-world");return}if(!d&&e.vaultReadyFor(n))return;let g=++e.vaultLoadGen;e.state._vaultLoading=!0,e.state._vaultWorldId=n,e.currentView==="world"&&e.patchWorldPanels();try{let _=await e.api(`/worlds/${encodeURIComponent(n)}/vault`);if(g!==e.vaultLoadGen)return;e.state._worldVault=_.vault||null,e.state._vaultGraph=_.vault_graph||null,e.state._vaultWorldId=n,e.invalidateGraphCache("graph-world")}catch{if(g!==e.vaultLoadGen)return;e.clearVaultScopedState()}finally{g===e.vaultLoadGen&&(e.state._vaultLoading=!1)}}async function D(n,d={}){if(!n||n==="root"){e.clearVaultScopedState();return}d.force&&(e.state._vaultWorldId=null),await e.loadWorldVault(n,{force:!0})}async function I(){try{let n=await e.api("/graph/world");e.state._worldFull=n,e.state._worldGraph=n?.graph??null,e.state._worldHierarchyGraph=n?.hierarchy_graph??null,e.state._worldPreviews=n?.world_previews??{},n?.worlds&&(e.state.worlds=n.worlds),e.populateWorldSelect(),e.invalidateGraphCache("graph-world")}catch(n){console.warn("world tree reload failed:",n)}}async function v(n,d={}){if(!n||n==="root"){e.clearVaultScopedState();return}!d.force&&e.vaultReadyFor(n)||await e.loadWorldVault(n,{force:!!d.force})}function y(){let n=e.inspectorWorldId(),d=e.state.activeWorldId||"root";e.$$("[data-inspect-world]").forEach(_=>{let R=_.dataset.inspectWorld;_.classList.toggle("is-inspect",R===n),_.classList.toggle("is-active",R===d)});let g=document.querySelector(".worlds-stat [data-active-world-label]");g&&(g.textContent=e.activeWorldLabel())}function O(){if(e.currentView!=="world")return;let n=e.inspectorWorldId(),d=e.worldById(n),g=e.state._worldFull?.snapshot||e.state.snapshot||{},_=document.getElementById("world-inspector");_&&(_.innerHTML=e.renderWorldInspector(d,g));let R=document.getElementById("world-vault-mount");if(e.isRootWorld(d))R&&(R.innerHTML="");else{let N=e.renderWorldVaultPanel(d);R&&(R.innerHTML=N)}e.patchWorldTreeNav(),e.drawGraphs()}async function P(n={}){let d=e.currentWorldId(),g=e.inspectorWorldId(),_=n.vaultWorldId||(e.currentView==="world"?g:d);!_||_==="root"?e.clearVaultScopedState():await e.ensureVaultForWorld(_,{force:!!n.forceVault}),e.currentView==="world"&&n.reloadTree?await e.reloadWorldTree():(e.currentView==="world"||e.currentView==="dashboard")&&await e.loadGraphData(),e.drawGraphs()}function G(n){let d=n||"root";e.inspectorWorldId()===d&&e.vaultReadyFor(d)&&!e.state._vaultLoading||(e.state.inspectorWorldId=d,e.currentView==="world"&&(e.state._motionSkipOnce=!0,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.patchWorldPanels(),e.reloadVault(d,{force:!0}).then(()=>{e.patchWorldPanels(),FOSMotion?.flashElement?.(e.$("#world-inspector")),window.FOSGraph?.highlightWorld("graph-world",e.inspectorWorldId(),e.currentWorldId())}).catch(console.error)))}function J(n,d,g,_){let R=n?.id||"root",N=`
      <button type="button" class="world-tree-item is-root${g===R?" is-inspect":""}${_===R?" is-active":""}"
        data-inspect-world="${e.esc(R)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(n?.name||"Main world")}</span>
          <span class="sub">Top-level \xB7 all ventures</span>
        </span>
      </button>`,B=d.map(H=>`
      <button type="button" class="world-tree-item kind-${e.esc(H.kind||"project")}${g===H.id?" is-inspect":""}${_===H.id?" is-active":""}"
        data-inspect-world="${e.esc(H.id)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${e.esc(H.name)}</span>
          <span class="sub">${e.esc(H.kind||"project")} \xB7 ${e.esc((H.description||"No description").slice(0,42))}</span>
        </span>
      </button>`).join("");return`
      <nav class="world-tree-nav" aria-label="World hierarchy">
        ${N}
        ${d.length?`<div class="world-tree-children">${B}</div>`:""}
      </nav>`}function z(n,d){if(!n)return'<p class="body-md muted">Select a world to inspect its context.</p>';let g=n.id||"root",_=g==="root",R=_?"root":n.kind||"project",N=e.currentWorldId(),H=(e.state._worldPreviews||e.state._worldFull?.world_previews||{})[g]||"",V=d?.crm||{},W=d?.finance||{};if(e.state.worldEditing===g)return`
        <form class="world-edit-form" id="world-edit-form" data-world-id="${e.esc(g)}">
          <div class="world-inspector-title">
            <h2>Edit ${e.esc(n.name)}</h2>
            ${e.worldKindBadge(R)}
          </div>
          ${_?`
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
                ${(e.state._worldTemplates||[]).map(x=>`<option value="${e.esc(x.id)}"${(n.template||"")===x.id?" selected":""}>${e.esc(x.label)}</option>`).join("")||`<option value="startup"${(n.template||"startup")==="startup"?" selected":""}>Startup / venture</option>`}
              </select>
            </label>`}
          <label>Description<textarea class="text-input-on-dark" name="description" rows="2">${e.esc(n.description||"")}</textarea></label>
          <label>Agent context<textarea class="text-input-on-dark" name="context" rows="5">${e.esc(n.context||"")}</textarea></label>
          <div class="world-inspector-actions">
            <button type="submit" class="button-primary button-sm">Save</button>
            <button type="button" class="button-tertiary-text button-sm" data-cancel-edit>Cancel</button>
          </div>
        </form>`;let T=_?[["Contacts",V.total_contacts||0],["Follow-ups",V.followups_due||0],["Open tasks",d?.tasks_open||0],["Approvals",d?.approvals_pending||0]]:[];_&&W?.set&&T.push(["Runway",W.runway_months!=null?`${W.runway_months} mo`:"\u2014"]);let ee=_?e.worldTreeData().children||[]:[],Z=(d?.goals_active||[]).slice(0,5);return`
      <div class="world-inspector-title">
        <div>
          <h2>${e.esc(n.name)}</h2>
          <p class="world-meta">id: ${e.esc(g)}${n.updated_at?` \xB7 updated ${e.esc(n.updated_at)}`:""}</p>
        </div>
        ${e.worldKindBadge(R)}
      </div>
      ${N===g?'<p class="world-meta" style="color:var(--color-primary)">\u25CF Active for chat &amp; agents</p>':'<p class="world-meta">Not active \u2014 switch from the top bar or below</p>'}
      <div class="world-inspector-section">
        <h4>Description</h4>
        <p>${e.esc(n.description||"No description yet.")}</p>
      </div>
      <div class="world-inspector-section">
        <h4>Agent context</h4>
        <p>${e.esc(n.context||"No focused context \u2014 add what the agent should know in this world.")}</p>
      </div>
      ${T.length?`
        <div class="world-inspector-section">
          <h4>Global snapshot</h4>
          <div class="world-inspector-facts">${T.map(([x,se])=>`<div class="world-inspector-fact"><span class="k">${e.esc(x)}</span><span class="v">${e.esc(String(se))}</span></div>`).join("")}</div>
        </div>`:""}
      ${_&&ee.length?`
        <div class="world-inspector-section">
          <h4>Sub-worlds indexed (${ee.length})</h4>
          <div class="world-inspector-facts">${ee.map(x=>`<div class="world-inspector-fact"><span class="k">${e.esc(x.name)}</span><span class="v">${e.esc(x.kind||"project")}</span></div>`).join("")}</div>
        </div>`:""}
      ${_?"":`
        <div class="world-inspector-section">
          <h4>Template</h4>
          <p class="body-md">${e.esc(n.template||R)} \u2014 facet folders on disk under <code class="mono">data/knowledge/</code></p>
          ${n.github_repo?`<p class="world-meta">GitHub: ${e.esc(n.github_repo)}</p>`:""}
          ${n.repo_path?`<p class="world-meta">Repo: ${e.esc(n.repo_path)}</p>`:""}
        </div>`}
      ${!_&&e.worldTreeData().root?`
        <div class="world-inspector-section">
          <h4>Parent</h4>
          <p class="body-md">${e.esc(e.worldTreeData().root.name)} <span class="world-meta">(main world)</span></p>
        </div>`:""}
      ${Z.length&&_?`
        <div class="world-inspector-section">
          <h4>Active goals</h4>
          <p class="body-md">${Z.map(x=>e.esc(typeof x=="string"?x:x.title||x)).join(" \xB7 ")}</p>
        </div>`:""}
      <div class="world-inspector-section">
        <h4>What the agent sees</h4>
        <pre class="world-context-preview">${e.esc(H||"Preview loads when graph data is fetched\u2026")}</pre>
      </div>
      <div class="world-inspector-actions">
        <button type="button" class="button-primary button-sm" data-use-world="${e.esc(g)}">Use in chat</button>
        <button type="button" class="button-outline-on-dark button-sm" data-set-active-world="${e.esc(g)}">Set active</button>
        <button type="button" class="button-tertiary-text button-sm" data-edit-world="${e.esc(g)}">Edit</button>
        ${_?"":`<button type="button" class="button-tertiary-text button-sm" data-delete-world="${e.esc(g)}">Delete</button>`}
      </div>`}function X(n,d,g){let _=e.state.ui?.vaultDocEdit,R=g||d[0]?.id||d[0]?.folder||"docs",N=d.find(W=>(W.id||W.folder)===R)||d[0]||{label:R,id:R},B=_&&_.title||"",H=_&&_.description||"",V=_?.id||"";return`
      <form class="human-form vault-doc-form" id="vault-doc-form" data-world-id="${e.esc(n.id)}" data-facet-id="${e.esc(R)}">
        ${V?`<input type="hidden" name="doc_id" value="${V}">`:""}
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Category slot</span>
            <select class="text-input-on-dark" name="facet_id" id="vault-doc-facet">
              ${d.map(W=>{let Q=W.id||W.folder;return`<option value="${e.esc(Q)}"${Q===R?" selected":""}>${e.esc(W.label)}</option>`}).join("")}
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Title</span>
            <input class="text-input-on-dark" name="title" required placeholder="e.g. Current ICP" value="${e.esc(B)}"></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description (indexed for search)</span>
          <textarea class="text-input-on-dark" name="description" rows="3" placeholder="Short summary agents use to find this doc. Full content goes to ${e.esc(e.vaultStorageLabel())}.">${e.esc(H)}</textarea></label>
        ${V?`
        <label class="human-field"><span class="caption-uppercase">Document body (markdown)</span>
          <textarea class="text-input-on-dark" name="content" id="vault-doc-content" rows="8" placeholder="Loading\u2026"></textarea></label>`:`
        <label class="human-field"><span class="caption-uppercase">Upload file</span>
          <input type="file" name="file" accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json"></label>
        <label class="human-field"><span class="caption-uppercase">Or paste markdown</span>
          <textarea class="text-input-on-dark" name="content" rows="6" placeholder="# ICP

Target: \u2026"></textarea></label>`}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm">${V?"Update document":"Add document"}</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-cancel-doc>Cancel</button>
        </div>
        <p class="world-meta">Slot: <strong>${e.esc(N.label)}</strong> \xB7 Full files in ${e.esc(e.vaultStorageLabel())}; only title + description in vector index.</p>
      </form>`}function ae(n,d){let g=e.state._githubStatus||{},_=!!g.connected,R=!!g.oauth_configured,N=d.github_repos||[],H=(e.state._githubRepos||[]).map(W=>`<option value="${e.esc(W.full_name)}">${e.esc(W.full_name)}${W.private?" (private)":""}</option>`).join(""),V=N.map(W=>{let Q=e.isLinkSyncing(W.id),T=e.githubRepoDocuments(d,W.full_name),ee=e.findReadmeDoc(T),Z=T.filter(se=>e.isMarkdownFilename(se.github_path||se.filename)),x=Z.length?`<div class="github-tree github-tree--repo">${e.renderGithubTreeNode(e.buildGithubPathTree(Z),n.id)}</div>`:"";return`
      <div class="github-repo-row">
        <div>
          <strong class="mono">${e.esc(W.full_name)}</strong>
          ${Q?'<span class="sync-badge">Syncing</span>':""}
          <span class="world-meta">${W.file_count||T.length||0} files synced${W.synced_at?` \xB7 ${e.esc(W.synced_at)}`:""}</span>
          ${W.last_error?`<span class="world-meta" style="color:var(--color-warn)">${e.esc(W.last_error)}</span>`:""}
        </div>
        <div class="github-repo-row__actions">
          <button type="button" class="button-primary button-sm" data-vault-view-doc="${ee?.id||""}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(ee?.title||`${W.full_name} README`)}"${!ee||Q?" disabled":""}>Open README</button>
          <button type="button" class="button-outline-on-dark button-sm${Q?" is-busy":""}" data-github-sync="${W.id}" data-world-id="${e.esc(n.id)}"${Q?" disabled":""}>${Q?"Syncing\u2026":`Sync to ${e.esc(e.vaultStorageLabel())}`}</button>
          <button type="button" class="button-tertiary-text button-sm" data-github-unlink="${W.id}" data-world-id="${e.esc(n.id)}"${Q?" disabled":""}>Unlink</button>
        </div>
        ${T.length?`<details class="github-repo-files" open>
          <summary class="caption-uppercase">Repo structure \xB7 ${Z.length} markdown file${Z.length===1?"":"s"}</summary>
          ${x||"<p class='muted body-md'>No markdown files synced yet.</p>"}
        </details>`:'<p class="body-md muted github-repo-files-empty">No files synced yet \u2014 link and sync to browse the repo tree here.</p>'}
      </div>`}).join("");return R?_?`<section class="github-repos-panel">
      <div class="github-repos-panel__head">
        <div>
          <p class="section-eyebrow">GitHub repositories</p>
          <p class="body-md muted">Connected as <strong>${e.esc(g.user?.login||"GitHub")}</strong> \u2014 link multiple repos; files sync to ${e.esc(e.vaultStorageLabel())} with searchable descriptions.</p>
        </div>
      </div>
      <div class="human-form__row" style="align-items:flex-end">
        <label class="human-field" style="flex:1">
          <span class="caption-uppercase">Add repository</span>
          <select class="text-input-on-dark" id="github-repo-pick">
            <option value="">Select a repository\u2026</option>
            ${H}
          </select>
        </label>
        <button type="button" class="button-primary button-sm" data-github-add="${e.esc(n.id)}"${e.state._syncingLinkIds.size?" disabled":""}>Link &amp; sync</button>
      </div>
      <div class="github-repo-list">${V||"<p class='body-md muted'>No GitHub repos linked yet.</p>"}</div>
    </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub repositories</p>
        <p class="body-md muted">Authorize GitHub to browse your repos and sync docs into this world's knowledge graph (${e.esc(e.vaultStorageLabel())}).</p>
        <a class="button-primary button-sm" href="/api/github/auth/start?world_id=${encodeURIComponent(n.id)}">Connect GitHub</a>
      </section>`:`<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub</p>
        <p class="body-md muted">Add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to <code>.env</code>, register callback <code>${e.esc(g.redirect_uri||"/api/github/callback")}</code>, then restart.</p>
      </section>`}function K(n,d){let g=n.facets||n.folders||[],_=n.storage_backend||(e.vaultStorageLabel()==="S3"?"s3":"local");return`
      <div class="vault-registry-bar" role="status" aria-live="polite">
        <span class="vault-registry-chip"><span class="k">Template</span> ${e.esc(n.template_id||d.template||"startup")}</span>
        <span class="vault-registry-chip"><span class="k">Slots</span> ${g.length}</span>
        <span class="vault-registry-chip"><span class="k">Docs</span> ${n.document_count||0}</span>
        <span class="vault-registry-chip"><span class="k">Storage</span> ${e.esc(_)}</span>
        <button type="button" class="button-tertiary-text button-sm" data-vault-reload="${e.esc(d.id)}">Reload registry</button>
      </div>`}function C(n){if(!n||n.id==="root")return"";if(e.state._vaultLoading||e.state._vaultWorldId!==n.id)return`
      <section class="driver-card vault-panel knowledge-panel panel-loading" style="margin-top:var(--space-md)">
        <p class="section-eyebrow">Knowledge vault</p>
        <h3 class="title-sm">${e.esc(n.name)}</h3>
        <div class="skeleton-grid" style="margin-top:var(--space-sm)">
          ${e.skeletonCard(3)}${e.skeletonCard(3)}${e.skeletonCard(3)}
        </div>
      </section>`;let d=e.vaultPayload()||{},g=d.facets||d.folders||[],_=d.domain_counts||{},R=e.state.ui?.vaultFacet||g[0]?.id||g[0]?.folder||null,N=e.state.ui?.vaultDocForm||e.state.ui?.vaultDocEdit,B=(g.find(T=>(T.id||T.folder)===R)||{}).documents||[],H=g.map(T=>{let ee=T.id||T.folder,Z=(T.documents||[]).length+(T.files||[]).length;return`<button type="button" class="vault-facet-tab${ee===R?" is-active":""}" data-vault-facet="${e.esc(ee)}">${e.esc(T.label)} <span class="badge-pill">${Z}</span></button>`}).join(""),V=B.map(T=>{let ee=T.github_path?` \xB7 ${T.github_path}`:"",Z=e.isMarkdownFilename(T.filename||T.github_path);return`
      <article class="vault-doc-card" data-doc-id="${T.id}">
        <div class="vault-doc-card__head">
          <h4>${e.esc(T.title)}</h4>
          <span class="world-meta">${e.esc(T.filename||"")}${e.esc(ee)} \xB7 ${e.formatBytes(T.size_bytes)}${T.source_type==="github"?" \xB7 GitHub":""}</span>
        </div>
        <p class="body-md">${e.esc(T.description||"No description")}</p>
        <div class="vault-doc-card__actions">
          ${Z?`<button type="button" class="button-primary button-sm" data-vault-view-doc="${T.id}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(T.title)}">View</button>`:""}
          <button type="button" class="button-outline-on-dark button-sm" data-tag-vault-doc="${T.id}" data-world-id="${e.esc(n.id)}" data-doc-title="${e.esc(T.title)}" data-doc-path="${e.esc(T.github_path||T.filename||"")}">Tag in agent</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-edit-doc="${T.id}">Edit</button>
          <button type="button" class="button-tertiary-text button-sm" data-vault-delete-doc="${T.id}">Remove</button>
        </div>
      </article>`}).join(""),W=(g.find(T=>(T.id||T.folder)===R)||{}).files||[],Q=W.length?`<ul class="vault-file-list">${W.map(T=>`<li class="mono">${e.esc(T.relative||T.name)} <span class="muted">on disk</span></li>`).join("")}</ul>`:"";return`
      <section class="driver-card vault-panel knowledge-panel" style="margin-top:var(--space-md)">
        <div class="vault-panel-head">
          <div>
            <p class="section-eyebrow">Knowledge graph</p>
            <h3 class="title-sm">${e.esc(n.name)} \u2014 ${e.esc(d.template_id||n.template||"startup")} template</h3>
            <p class="body-md muted">Category slots for this world type. Add docs with a searchable description; large files live in ${e.esc(e.vaultStorageLabel())}. Open the <strong>Files</strong> tab in the map above for the folder graph.</p>
            <p class="world-meta">${d.document_count||0} registered docs \xB7 ${e.esc(d.vault_path||"")}${d.repo_path?` \xB7 repo: ${e.esc(d.repo_path)}`:""}</p>
          </div>
          <div class="vault-panel-actions">
            <button type="button" class="button-primary button-sm" data-vault-add-doc="${e.esc(n.id)}">Add document</button>
            <button type="button" class="button-outline-on-dark button-sm" data-world-graph-tab="vault">Open file map</button>
            <input class="text-input-on-dark" id="vault-repo-path" placeholder="Local repo path" value="${e.esc(n.repo_path||"")}">
            <button type="button" class="button-outline-on-dark button-sm" data-vault-link="${e.esc(n.id)}">Link repo</button>
            <button type="button" class="button-outline-on-dark button-sm" data-vault-ingest="${e.esc(n.id)}">Re-ingest</button>
          </div>
        </div>
        ${e.renderGithubReposPanel(n,d)}
        ${e.renderVaultRegistryBar(d,n)}
        <div class="vault-facet-tabs" role="tablist">${H||"<span class='muted'>No categories</span>"}</div>
        ${N?e.renderVaultDocForm(n,g,R):""}
        <div class="vault-doc-grid">${V||"<p class='body-md muted'>No documents in this slot yet \u2014 add your ICP, GTM notes, research, etc.</p>"}</div>
        ${Q}
        <div class="vault-search-row">
          <input class="text-input-on-dark" id="vault-search-q" placeholder="Search descriptions in this world\u2026">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-search="${e.esc(n.id)}">Search</button>
        </div>
        <pre class="vault-search-results mono" id="vault-search-results" hidden></pre>
      </section>`}function r(){let n=e.state._worldFull||{},d=n.worlds||e.state.worlds||{},g=d.root||{},_=d.children||[],R=e.inspectorWorldId(),N=e.currentWorldId(),B=e.worldById(R)||g,H=n.snapshot||e.state.snapshot||{},V=e.state.config?.my_name||"You";e.isRootWorld(B)&&e.worldGraphTab==="vault"&&(e.worldGraphTab="hierarchy");let W=!e.isRootWorld(B);return`
      <div class="worlds-page">
        <section class="worlds-hero">
          <div class="worlds-hero-lead">
            <h2>${e.esc(V)}'s world map</h2>
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
              ${e.renderWorldTreeNav(g,_,R,N)}
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
              ${e.renderWorldInspector(B,H)}
            </div>
          </section>
        </div>
  
        ${e.isRootWorld(B)?"":`<div id="world-vault-mount">${e.renderWorldVaultPanel(B)}</div>`}
  
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
      </div>`}function c(n){return!n||n.id==="root"}async function $(n){let d=new FormData(n),g=(d.get("name")||"").toString().trim();if(g)try{let _=await e.api("/worlds",{method:"POST",body:JSON.stringify({name:g,kind:(d.get("kind")||"project").toString(),template:(d.get("template")||"").toString().trim()||void 0,description:(d.get("description")||"").toString().trim(),context:(d.get("context")||"").toString().trim(),repo_path:(d.get("repo_path")||"").toString().trim(),github_repo:(d.get("github_repo")||"").toString().trim()})});e.state.worlds=_.tree,e.setActiveWorld(_.world?.id),await e.refresh(),e.currentView==="world"&&(await e.reloadWorldTree(),e.selectInspectorWorld(_.world?.id)),n.reset(),e.state.ui&&(e.state.ui.worldCreateOpen=!1)}catch(_){alert(_.message)}}async function A(n){let d=n.dataset.worldId;if(!d)return;let g=new FormData(n),_={name:(g.get("name")||"").toString().trim(),description:(g.get("description")||"").toString(),context:(g.get("context")||"").toString()};if(d!=="root"){_.kind=(g.get("kind")||"project").toString();let R=(g.get("template")||"").toString().trim();R&&(_.template=R)}try{let R=await e.api(`/worlds/${encodeURIComponent(d)}`,{method:"PATCH",body:JSON.stringify(_)});e.state.worlds=R.tree,e.state.worldEditing=null,e.currentView==="world"?(await e.reloadWorldTree(),await e.reloadVault(d,{force:!0}),e.patchWorldPanels()):await e.refresh()}catch(R){alert(R.message)}}async function E(n){let d=n.dataset.worldId,g=(n.querySelector("[name=doc_id]")?.value||"").trim(),_=new FormData(n),R=(_.get("title")||"").toString().trim(),N=(_.get("facet_id")||n.dataset.facetId||"docs").toString(),B=(_.get("description")||"").toString().trim(),H=(_.get("content")||"").toString(),V=n.querySelector('input[type="file"]')?.files?.[0];try{if(g)await e.api(`/worlds/${encodeURIComponent(d)}/vault/documents/${encodeURIComponent(g)}`,{method:"PATCH",body:JSON.stringify({title:R,description:B,facet_id:N,content:H||void 0})});else if(V){let W=new FormData;W.append("file",V),W.append("title",R),W.append("description",B),W.append("facet_id",N),await e.apiUpload(`/worlds/${encodeURIComponent(d)}/vault/documents`,W)}else if(H.trim())await e.api(`/worlds/${encodeURIComponent(d)}/vault/documents`,{method:"POST",body:JSON.stringify({title:R,description:B,facet_id:N,content:H})});else return alert("Upload a file or paste markdown content.");e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),await e.reloadVault(d,{force:!0}),e.afterVaultMutation(d)}catch(W){alert(W.message)}}async function F(n,d){e.state.ui||(e.state.ui={});try{let g=await e.api(`/worlds/${encodeURIComponent(n)}/vault/documents/${encodeURIComponent(d)}/content`);e.state.ui.vaultDocEdit=g.document,e.state.ui.vaultDocForm=!0,e.state.ui.vaultFacet=g.document?.facet_id||e.state.ui.vaultFacet,e.currentView==="world"?e.patchWorldPanels():e.render();let _=e.$("#vault-doc-content");_&&(_.value=g.content||"")}catch(g){alert(g.message)}}async function q(n){let d=e.$("#github-repo-pick")?.value?.trim();if(!d)return alert("Select a repository");let g=document.querySelector(`[data-github-add="${n}"]`);g&&(g.disabled=!0);try{let _=await e.api(`/worlds/${encodeURIComponent(n)}/repos`,{method:"POST",body:JSON.stringify({full_name:d}),timeoutMs:12e4});if(_.job?.status==="failed")throw new Error(_.job.message||"Could not start sync");_.job?.id?await e.runGithubSyncJob(_.job.id,`Syncing ${d}`,{worldId:n,linkId:_.repo?.id}):(await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n))}catch(_){alert(_.message)}finally{g&&(g.disabled=e.state._syncingLinkIds.size>0)}}async function Y(n,d){if(!e.isLinkSyncing(d))try{let g=await e.api(`/worlds/${encodeURIComponent(n)}/repos/${encodeURIComponent(d)}/sync`,{method:"POST",body:"{}",timeoutMs:12e4});if(g.job?.status==="failed")throw new Error(g.job.message||"Could not start sync");if(g.job?.id){let _=(e.state._worldVault?.github_repos||[]).find(R=>String(R.id)===String(d))?.full_name||"repository";await e.runGithubSyncJob(g.job.id,`Re-syncing ${_}`,{worldId:n,linkId:d})}}catch(g){alert(g.message)}}async function te(n,d){if(confirm("Unlink this repo and remove its synced documents from this world?"))try{await e.api(`/worlds/${encodeURIComponent(n)}/repos/${encodeURIComponent(d)}`,{method:"DELETE"}),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(g){alert(g.message)}}async function h(n,d){if(confirm("Remove this document from the knowledge graph?"))try{await e.api(`/worlds/${encodeURIComponent(n)}/vault/documents/${encodeURIComponent(d)}`,{method:"DELETE"}),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(g){alert(g.message)}}async function w(n){try{let d=await e.api(`/worlds/${encodeURIComponent(n)}/vault/ingest`,{method:"POST",body:"{}"});alert(`Ingested ${d.files||0} files (${d.total_chunks||0} chunks)`),await e.reloadVault(n,{force:!0}),e.afterVaultMutation(n)}catch(d){alert(d.message)}}async function L(n){let d=e.$("#vault-repo-path")?.value?.trim();if(!d)return alert("Enter a local repo path");try{let g=await e.api(`/worlds/${encodeURIComponent(n)}/vault/link-repo`,{method:"POST",body:JSON.stringify({repo_path:d})});if(g.error)return alert(g.error);alert(`Linked and ingested ${g.files||0} files`),await e.reloadVault(n,{force:!0}),await e.refresh(),e.afterVaultMutation(n)}catch(g){alert(g.message)}}async function M(n){let d=e.$("#vault-search-q")?.value?.trim();if(!d)return;let g=e.$("#vault-search-results");try{let R=((await e.api(`/vault/search?${new URLSearchParams({q:d,world_id:n})}`)).hits||[]).map(N=>`[${N.metadata?.domain||"?"}] ${N.metadata?.source||""}
${(N.text||"").slice(0,200)}`).join(`

---

`)||"No hits.";g&&(g.textContent=R,g.hidden=!1)}catch(_){g&&(g.textContent=_.message,g.hidden=!1)}}async function j(n){if(confirm("Delete this sub-world?"))try{let d=await e.api(`/worlds/${encodeURIComponent(n)}`,{method:"DELETE"});e.state.worlds=d.tree,e.currentWorldId()===n&&e.setActiveWorld("root"),e.inspectorWorldId()===n&&e.selectInspectorWorld("root"),await e.refresh(),e.currentView==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.render())}catch(d){alert(d.message)}}e.renderWorldOptionsForDocs=S,e.githubRepoDocuments=k,e.findReadmeDoc=b,e.countGithubTreeFiles=a,e.renderGithubTreeNode=p,e.tagVaultDocInChat=u,e.buildVaultGraph=m,e.vaultGraphForWorld=o,e.worldGraphLegendHtml=t,e.renderWorldCreateForm=s,e.worldById=l,e.inspectorWorldId=i,e.loadWorldVault=f,e.reloadVault=D,e.reloadWorldTree=I,e.ensureVaultForWorld=v,e.patchWorldTreeNav=y,e.patchWorldPanels=O,e.onWorldContextChanged=P,e.selectInspectorWorld=G,e.renderWorldTreeNav=J,e.renderWorldInspector=z,e.renderVaultDocForm=X,e.renderGithubReposPanel=ae,e.renderVaultRegistryBar=K,e.renderWorldVaultPanel=C,e.renderWorld=r,e.isRootWorld=c,e.createWorldFromForm=$,e.saveWorldEdit=A,e.submitVaultDoc=E,e.startVaultDocEdit=F,e.connectGithubRepo=q,e.syncGithubRepo=Y,e.unlinkGithubRepo=te,e.deleteVaultDoc=h,e.vaultIngest=w,e.vaultLinkRepo=L,e.vaultSearch=M,e.deleteWorld=j}function ke(e){function S(){let y=e.state.ui?.crmTab||localStorage.getItem("fos_crm_tab")||"contacts";return y==="outreach"?"contacts":y}function k(y){let O=e.state.worlds||e.state._worldFull?.worlds||{},P=O.root,G=O.children||[],J=[];return P&&J.push(`<option value="${e.esc(P.id||"root")}"${(y||"root")===(P.id||"root")?" selected":""}>${e.esc(P.name||"Main world")}</option>`),G.forEach(z=>{J.push(`<option value="${e.esc(z.id)}"${y===z.id?" selected":""}>${e.esc(z.name||z.id)}</option>`)}),J.join("")}function b(y={}){let O=e.crmTab();return`<nav class="crm-tabs" role="tablist" aria-label="CRM sections">${[["contacts","Contacts",y.contacts],["companies","Companies",y.companies],["pipeline","Pipeline",null]].map(([G,J,z])=>`<button type="button" role="tab" aria-selected="${O===G}" class="crm-tab${O===G?" crm-tab--active":""}" data-crm-tab="${G}">${e.esc(J)}${z!=null?`<span class="crm-tab__count">${z}</span>`:""}</button>`).join("")}</nav>`}function a(){let y=e.state._crm?.contacts||[],O=e.state._crm?.followups_due||[],P=!!e.state.ui?.crmFormOpen,G=e.state._crmCompanies?.companies||[],J=K=>e.CRM_STATUSES.map(C=>`<option value="${C}"${C===K?" selected":""}>${e.esc(C)}</option>`).join(""),z='<option value="">\u2014 None \u2014</option>'+G.map(K=>`<option value="${K.id}">${e.esc(K.name)}</option>`).join(""),X=y.slice(0,50).map(K=>`<tr>
      <td>${e.esc(K.name)}</td><td>${e.esc(K.company||"\u2014")}</td><td>${e.esc(K.role||"\u2014")}</td>
      <td><select class="text-input-on-dark crm-status-select" data-crm-status="${K.id}" aria-label="Status for ${e.esc(K.name)}">${J(K.status||"prospect")}</select></td>
      <td class="muted">${e.esc(K.email||"")}</td>
      <td class="muted">${e.esc(K.phone||"")}</td>
      <td><label class="human-field--checkbox" style="margin:0">
        <input type="checkbox" data-crm-whatsapp="${K.id}" ${K.whatsapp_enabled?"checked":""} ${K.phone?"":"disabled"} aria-label="Allow WhatsApp for ${e.esc(K.name)}">
      </label></td>
      <td>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${K.id}" data-followup-days="3">3d</button>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${K.id}" data-followup-days="7">7d</button>
        ${K.whatsapp_enabled?`<button type="button" class="button-tertiary-text button-sm" data-crm-wa-thread="${K.id}">WA</button>`:""}
      </td></tr>`).join(""),ae=O.map(K=>`<li class="crm-followup-row">
      <span>${e.esc(K.name)} @ ${e.esc(K.company||"?")}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goto="crm">Open</button>
    </li>`).join("")||"<li class='muted'>None due</li>";return`
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Contacts</p>
            <h3 class="title-sm">People &amp; follow-ups</h3>
          </div>
          <button type="button" class="button-primary button-sm" data-toggle-ui="crmFormOpen">${P?"Hide form":"Add contact"}</button>
        </div>
        ${P?`
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
              <select class="text-input-on-dark" name="status">${J("prospect")}</select></label>
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
        <tbody>${X||'<tr><td colspan="8" class="muted">No contacts yet \u2014 use Add contact above.</td></tr>'}</tbody></table></div>
        ${e.state._crmWaThread?.length?`<div class="driver-card" style="margin-top:var(--space-md)">
          <p class="caption-uppercase">WhatsApp thread</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${e.state._crmWaThread.map(K=>`<li><span class="muted">${e.esc((K.sent_at||"").slice(0,16).replace("T"," "))}</span> <strong>${e.esc(K.direction||"")}</strong>: ${e.esc((K.body||"").slice(0,200))}</li>`).join("")}</ul>
        </div>`:""}
      </section>`}function p(){if(e.state._crmCompaniesLoading)return`<section class="driver-card span-12 crm-loading-panel" aria-busy="true">
        <div class="crm-skeleton crm-skeleton--title"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
      </section>`;if(e.state._crmCompaniesError)return`<section class="driver-card span-12 crm-error-panel">
        <p class="body-md">Could not load companies \u2014 ${e.esc(e.state._crmCompaniesError)}</p>
        <button type="button" class="button-primary button-sm" data-crm-reload>Retry</button>
      </section>`;let y=e.state._crmCompanies?.companies||[],O=e.state._crmCompanies?.meta?.unlinked_contact_companies||0,P=!!e.state.ui?.crmCompanyFormOpen,G=e.state.ui?.crmCompanyDetail,J=e.currentWorldId(),z=r=>e.COMPANY_STATUSES.map(c=>`<option value="${c}"${c===r?" selected":""}>${e.esc(c)}</option>`).join(""),X=y.map(r=>`<tr>
      <td><button type="button" class="button-tertiary-text" data-crm-company-detail="${r.id}">${e.esc(r.name)}</button></td>
      <td>${e.esc(r.sector||r.industry||"\u2014")}</td>
      <td><span class="crm-status-pill crm-status-pill--${e.esc((r.status||"prospect").replace(/\s+/g,"-"))}">${e.esc(r.status||"prospect")}</span></td>
      <td>${r.contact_count??0}</td>
      <td class="muted">${e.esc((r.last_contacted_at||"").slice(0,10))}</td>
    </tr>`).join(""),ae="";if(G){let r=y.find($=>String($.id)===String(G))||e.state._crmCompanyDetail?.company,c=e.state._crmCompanyDetail?.contacts||[];r&&(ae=`<aside class="crm-company-drawer driver-card">
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
          <p class="caption-uppercase" style="margin-top:var(--space-md)">Linked contacts (${c.length})</p>
          <ul class="list-plain">${c.map($=>`<li>${e.esc($.name)} \u2014 ${e.esc($.role||"")} ${$.email?`<span class="muted">${e.esc($.email)}</span>`:""}</li>`).join("")||"<li class='muted'>None</li>"}</ul>
        </aside>`)}let K=O>0?`
      <div class="crm-import-banner">
        <div>
          <p class="body-md"><strong>${O}</strong> unique company name${O===1?"":"s"} on contacts not yet linked to company records.</p>
          <p class="body-sm muted">Import creates company rows and links your existing contacts automatically.</p>
        </div>
        <button type="button" class="button-primary button-sm" data-crm-import-companies>Import from contacts</button>
      </div>`:"",C=X?"":`
      <div class="crm-empty-state">
        <p class="body-md">No company records yet.</p>
        <p class="body-sm muted">${O>0?"Import from contacts above, or add a company manually.":"Add companies manually, or enter company names when adding contacts."}</p>
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
            <button type="button" class="button-primary button-sm" data-toggle-ui="crmCompanyFormOpen">${P?"Hide form":"Add company"}</button>
          </div>
        </div>
        ${K}
        ${P?`
        <form class="human-form" id="crm-company-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Company name"></label>
            <label class="human-field"><span class="caption-uppercase">World</span>
              <select class="text-input-on-dark" name="world_id" required>${e.renderWorldOptionsForCrm(J)}</select></label>
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
        <tbody>${X}</tbody></table></div>`}
        ${ae}
      </section>`}function u(){let y=e.state._crm?.pipeline||{},O=Object.entries(y).map(([z,X])=>`<div class="kv"><span class="k">${e.esc(z)}</span><span class="v">${X}</span></div>`).join("")||"<p class='muted'>No pipeline data</p>",P=e.state._crmCompanies?.companies||[],G={};P.forEach(z=>{let X=z.status||"prospect";G[X]=(G[X]||0)+1});let J=Object.entries(G).map(([z,X])=>`<div class="kv"><span class="k">${e.esc(z)}</span><span class="v">${X} companies</span></div>`).join("")||"<p class='muted'>No company pipeline data</p>";return`<section class="driver-card span-6"><p class="caption-uppercase">Contact pipeline</p><div style="margin-top:var(--space-sm)">${O}</div></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Company pipeline</p><div style="margin-top:var(--space-sm)">${J}</div></section>`}function m(){let y=e.crmTab(),O={contacts:e.state._crm?.contacts?.length||0,companies:e.state._crmCompanies?.companies?.length||0},P="";return y==="contacts"?P=e.renderCrmContactsPanel():y==="companies"?P=e.renderCrmCompaniesPanel():P=e.renderCrmPipelinePanel(),`<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <h2 class="title-md" style="text-wrap:balance">CRM</h2>
            <p class="body-sm muted">Contacts, companies, and pipeline. Batch outreach lives on the <button type="button" class="button-tertiary-text button-sm" data-goto="outreach">Outreach</button> page.</p>
          </div>
        </div>
        ${e.renderCrmTabs(O)}
      </section>
      ${P}
    </div>`}async function o(){let y=e.crmTab(),O=e.currentWorldId(),P=y==="companies"?"?include_unassigned=1":O&&O!=="root"?`?world_id=${encodeURIComponent(O)}&include_unassigned=1`:"?include_unassigned=1";e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[G,J]=await Promise.all([e.api("/crm/contacts"),e.api(`/crm/companies${P}`)]);e.state._crm=G,e.state._crmCompanies=J}catch(G){e.state._crmCompaniesError=G.message||"Could not load CRM data"}finally{e.state._crmCompaniesLoading=!1}}async function t(y){let O=new FormData(y),P=(O.get("name")||"").toString().trim();if(!P)return;let G=(O.get("company_id")||"").toString().trim();try{await e.api("/crm/contacts",{method:"POST",body:JSON.stringify({name:P,company_id:G?parseInt(G,10):null,role:(O.get("role")||"").toString().trim(),email:(O.get("email")||"").toString().trim(),status:(O.get("status")||"prospect").toString(),linkedin_url:(O.get("linkedin_url")||"").toString().trim(),phone:(O.get("phone")||"").toString().trim(),whatsapp_enabled:O.get("whatsapp_enabled")==="1",notes:(O.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmFormOpen=!1),await e.refresh(),e.render(),y.reset()}catch(J){alert(J.message)}}async function s(){let y=e.currentWorldId(),O=y&&y!=="root"?y:null;try{let P=await e.api("/crm/companies/import-from-contacts",{method:"POST",body:JSON.stringify({world_id:O})});await e.loadCrmData(),e.render();let G=`Imported ${P.created||0} companies and linked ${P.linked_contacts||0} contacts.`;e.state._toast?e.state._toast(G):alert(G)}catch(P){alert(P.message)}}async function l(y){let O=new FormData(y),P=(O.get("name")||"").toString().trim(),G=(O.get("world_id")||"").toString().trim();if(!(!P||!G))try{await e.api("/crm/companies",{method:"POST",body:JSON.stringify({name:P,world_id:G,sector:(O.get("sector")||"").toString().trim(),status:(O.get("status")||"prospect").toString(),website:(O.get("website")||"").toString().trim(),linkedin_url:(O.get("linkedin_url")||"").toString().trim(),notes:(O.get("notes")||"").toString().trim()})}),await e.loadCrmData(),e.state.ui&&(e.state.ui.crmCompanyFormOpen=!1),e.render(),y.reset()}catch(J){alert(J.message)}}async function i(y){if(y)try{let O=await e.api(`/crm/companies/${encodeURIComponent(y)}`);e.state._crmCompanyDetail=O,e.state.ui||(e.state.ui={}),e.state.ui.crmCompanyDetail=y,e.render()}catch(O){alert(O.message)}}async function f(y,O){if(!(!y||!O))try{await e.api(`/crm/contacts/${encodeURIComponent(y)}`,{method:"PATCH",body:JSON.stringify({status:O})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(P){alert(P.message)}}async function D(y,O){if(y)try{await e.api(`/crm/contacts/${encodeURIComponent(y)}`,{method:"PATCH",body:JSON.stringify({whatsapp_enabled:!!O})}),e.state._crm=await e.api("/crm/contacts"),await e.refresh(),e.render()}catch(P){alert(P.message)}}async function I(y){if(y)try{let O=await e.api(`/whatsapp/messages?contact_id=${encodeURIComponent(y)}`);e.state._crmWaThread=O.messages||[],e.render()}catch(O){alert(O.message)}}async function v(y,O){let P=parseInt(O,10)||7;await e.api(`/crm/contacts/${y}/followup`,{method:"POST",body:JSON.stringify({days:P}),timeoutMs:15e3}),e.state._crm=await e.api("/crm/contacts"),e.currentView==="crm"&&e.render()}e.crmTab=S,e.renderWorldOptionsForCrm=k,e.renderCrmTabs=b,e.renderCrmContactsPanel=a,e.renderCrmCompaniesPanel=p,e.renderCrmPipelinePanel=u,e.renderCrm=m,e.loadCrmData=o,e.submitCrmContact=t,e.importCrmCompaniesFromContacts=s,e.submitCrmCompany=l,e.openCrmCompanyDetail=i,e.updateCrmStatus=f,e.updateCrmWhatsapp=D,e.loadCrmWaThread=I,e.scheduleCrmFollowup=v}function Ce(e){function S(){return e.state.ui?.crmOutreachWorld||e.currentWorldId()}function k(){let h=e.state._crmCampaignReview,w=h?.campaign;return w?.status==="done"||h?.done&&!h?.pending_count?"complete":h?.campaign&&["review"].includes(w.status)&&h.pending_count>0?"review":h?.campaign&&["review"].includes(w.status)&&!h.pending_count?"complete":e.state._crmOutreachJob?.active||["researching","drafting","created"].includes(w?.status||e.state._crmOutreachJob?.status)||e.state.ui?.crmCampaignId&&w&&!["review","done","failed"].includes(w.status)?"running":"setup"}function b(){return e.state.ui?.crmOutreachBatch||5}function a(){return e.state.ui?.crmOutreachSelected||[]}function p(){return e.state.ui||(e.state.ui={}),Array.isArray(e.state.ui.crmOutreachDraft)||(e.state.ui.crmOutreachDraft=[...a()]),e.state.ui.crmOutreachDraft}function u(){let h=[...p()].sort((L,M)=>L-M).join(","),w=[...a()].sort((L,M)=>L-M).join(",");return h!==w}function m(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachDraft=[],e.state.ui.crmOutreachSelected=[]}function o(){e.state.ui||(e.state.ui={}),Array.isArray(e.state.ui.crmOutreachDraft)||(e.state.ui.crmOutreachDraft=[...a()])}function t(){let h=b(),w=new Set(p()),L=a().length,M=u(),j=document.getElementById("outreach-company-picker");if(!j)return;j.querySelectorAll("[data-crm-company-toggle]").forEach(W=>{let Q=parseInt(W.dataset.crmCompanyToggle,10),T=w.has(Q);W.checked=T,W.disabled=!T&&w.size>=h,W.closest(".outreach-company-row")?.classList.toggle("is-selected",T)});let n=j.querySelector(".outreach-select-meter__fill");n&&(n.style.width=`${Math.min(100,w.size/h*100)}%`);let d=document.getElementById("outreach-draft-count");d&&(d.textContent=String(w.size));let g=document.getElementById("outreach-batch-max");g&&(g.textContent=` / ${h}`);let _=document.getElementById("outreach-select-meter");_&&(_.setAttribute("aria-valuenow",String(w.size)),_.setAttribute("aria-valuemax",String(h)));let R=document.getElementById("outreach-saved-count");R&&(R.textContent=String(L));let N=document.getElementById("outreach-selection-dirty");N&&(N.hidden=!M);let B=document.getElementById("outreach-save-companies");B&&(B.disabled=!M||w.size===0,B.classList.toggle("is-pulse",M&&w.size>0));let H=document.getElementById("outreach-start-btn");if(H){let W=S(),Q=L>0&&W!=="root"&&!M;H.disabled=!Q,M?H.title="Save your company selection before starting":L?H.title="":H.title="Select and save at least one company"}let V=document.getElementById("outreach-batch-hint");V&&(V.textContent=w.size>=h?`Batch limit reached (${h})`:`Up to ${h} companies per campaign`)}function s(h){let w=parseInt(h.dataset.crmCompanyToggle,10);if(!w)return;e.state.ui||(e.state.ui={});let L=b(),M=new Set(p());if(h.checked){if(M.size>=L){h.checked=!1;return}M.add(w)}else M.delete(w);e.state.ui.crmOutreachDraft=[...M],t()}function l(){e.state.ui||(e.state.ui={});let h=p();if(!h.length)return;e.state.ui.crmOutreachSelected=[...h];let w=S();if(w)try{localStorage.setItem(`fos_outreach_sel_${w}`,JSON.stringify(h))}catch{}t();let L=document.getElementById("outreach-save-companies");L&&(L.classList.add("is-saved-flash"),setTimeout(()=>L?.classList.remove("is-saved-flash"),600))}function i(h){e.state.ui||(e.state.ui={});let w=parseInt(h,10)||5;e.state.ui.crmOutreachBatch=w;let L=p();L.length>w&&(e.state.ui.crmOutreachDraft=L.slice(0,w)),t()}function f(h){let w=(h||"").trim().toLowerCase();document.querySelectorAll("#outreach-company-picker .outreach-company-row").forEach(L=>{let M=(L.dataset.search||"").toLowerCase();L.hidden=!!(w&&!M.includes(w))})}function D(){let h=S();return(e.state._crmCompanies?.companies||[]).filter(w=>h&&h!=="root"&&w.world_id&&w.world_id!==h?!1:w.status==="prospect"||!w.status)}function I(h){if(!h||h.tagName!=="TEXTAREA")return;h.style.height="0px";let w=getComputedStyle(h),L=parseFloat(w.minHeight)||112;h.style.height=`${Math.max(L,h.scrollHeight)}px`,h.style.overflowY="hidden"}function v(h=document){let w=[...h.querySelectorAll(".crm-draft-body--fit, .outreach-auto-textarea")];if(!w.length)return;let L=()=>w.forEach(I);L(),requestAnimationFrame(()=>{L(),requestAnimationFrame(L)})}function y(h){if(h.channel==="email"){if(!(h.subject||"").trim())return"Subject required";if(!(h.body||"").trim())return"Body required";if(!(h.email||"").trim())return"Contact has no email"}if(h.channel==="whatsapp"){if(!(h.body||"").trim())return"Message required";if((h.body||"").length>300)return"Max 300 characters";if(!h.whatsapp_enabled)return"WhatsApp not allowlisted";if(!(h.phone||"").trim())return"No phone on contact"}return""}function O(h){let w=[["setup","1. Setup"],["running","2. Research & draft"],["review","3. Review & send"],["complete","4. Done"]],M={setup:0,running:1,review:2,complete:3}[h]??0;return`<nav class="crm-outreach-steps" aria-label="Outreach progress">${w.map(([j,n],d)=>`<span class="${d<M?"crm-outreach-step crm-outreach-step--done":d===M?"crm-outreach-step crm-outreach-step--active":"crm-outreach-step"}">${e.esc(n)}</span>`).join("")}</nav>`}function P(){let h=e.state._crmOutreachJob||{},w=e.state._crmCampaignDetail?.campaign||e.state._crmCampaignReview?.campaign||{},L=h.phase||w.status||"Starting\u2026",j=(e.state._crmCampaignReview?.companies||e.state._crmCampaignDetail?.review?.companies||[]).length||w.batch_size||"?";return`<section class="driver-card span-12 crm-outreach-running">
      <p class="section-eyebrow">Outreach in progress</p>
      <h3 class="title-sm">${e.esc(w.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("running")}
      <div class="crm-outreach-progress-strip">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:40%"></div></div>
        <p class="body-md"><strong>${e.esc(L)}</strong></p>
        <p class="muted body-sm">Researching companies via knowledge tree + web, then drafting messages. This runs in the background \u2014 you can leave this page.</p>
        <p class="muted body-sm">Batch: ${j} companies \xB7 World: <span data-active-world-label>${e.esc(e.activeWorldLabel())}</span></p>
      </div>
      <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-refresh>Refresh status</button>
    </section>`}function G(h){let w=h.progress||{},L=w.by_status||{};return`<section class="driver-card span-12">
      <p class="section-eyebrow">Campaign complete</p>
      <h3 class="title-sm">${e.esc(h.campaign?.name||"Campaign")}</h3>
      ${e.renderOutreachSteps("complete")}
      <div class="crm-outreach-summary">
        <div class="kv"><span class="k">Sent</span><span class="v">${L.sent||0}</span></div>
        <div class="kv"><span class="k">Skipped</span><span class="v">${L.skipped||0}</span></div>
        <div class="kv"><span class="k">Failed</span><span class="v">${L.failed||0}</span></div>
        <div class="kv"><span class="k">Companies</span><span class="v">${w.companies_complete||0}/${w.companies_total||0}</span></div>
      </div>
      <div class="human-form__actions" style="margin-top:var(--space-md)">
        <button type="button" class="button-primary button-sm" data-crm-outreach-back>Start new campaign</button>
      </div>
    </section>`}function J(h){let w=h.campaign,L=h.strategy||{},M=h.current_company,j=h.current_research||{},n=h.current_drafts||[],d=h.progress||{},g=n.filter(V=>V.channel==="email"),_=n.filter(V=>V.channel==="whatsapp"),R=M?.company_name||M?.name||"Company",N=d.company_index||1,B=d.companies_total||1,H=V=>{let W=e.draftApproveDisabledReason(V),Q=(V.body||"").length;return`<div class="crm-draft-card driver-card outreach-draft-card" data-draft-id="${V.id}">
        <div class="crm-draft-card__head">
          <p class="caption-uppercase">${V.channel==="email"?"Gmail":"WhatsApp"} \u2192 ${e.esc(V.contact_name||"Contact")}</p>
          ${V.channel==="email"?`<span class="muted body-sm">${e.esc(V.email||"")}</span>`:`<span class="muted body-sm">${e.esc(V.phone||"")}</span>`}
        </div>
        ${V.personalization_notes?`<p class="body-md muted outreach-draft-notes">${e.esc(V.personalization_notes)}</p>`:""}
        ${V.channel==="email"?`<label class="human-field outreach-draft-field"><span class="caption-uppercase">Subject</span>
          <input class="text-input-on-dark crm-draft-subject" data-draft-id="${V.id}" value="${e.esc(V.subject||"")}"></label>`:""}
        <label class="human-field outreach-draft-field"><span class="caption-uppercase">Message</span>
          <textarea class="text-input-on-dark crm-draft-body crm-draft-body--fit" data-draft-id="${V.id}" data-channel="${e.esc(V.channel)}" rows="1">${e.esc(V.body||"")}</textarea>
          ${V.channel==="whatsapp"?`<span class="caption muted crm-wa-count" data-draft-id="${V.id}">${Q}/300</span>`:""}
        </label>
        <div class="human-form__actions">
          <button type="button" class="button-primary button-sm" data-crm-draft-approve="${V.id}" ${W?'disabled title="'+e.esc(W)+'"':""}>Approve &amp; Send</button>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-draft-skip="${V.id}">Skip message</button>
        </div>
        ${V.error_message?`<p class="crm-draft-error">${e.esc(V.error_message)}</p>`:""}
        ${W?`<p class="muted body-sm">${e.esc(W)}</p>`:""}
      </div>`};return`<section class="driver-card span-12 outreach-review">
      <div class="human-panel__head">
        <div>
          <p class="section-eyebrow">Review &amp; send</p>
          <h3 class="title-sm">${e.esc(w.name||"Campaign")}</h3>
          <p class="muted body-sm">Company ${N} of ${B} \xB7 ${h.pending_count||0} message(s) left \u2014 approve one at a time</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-back>Exit review</button>
      </div>
      ${e.renderOutreachSteps("review")}
      <div class="crm-outreach-progress-meta">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:${Math.round((d.companies_complete||0)/Math.max(B,1)*100)}%"></div></div>
        <div class="crm-outreach-stats">
          <span class="badge-pill">Sent ${(d.by_status||{}).sent||0}</span>
          <span class="badge-pill">Skipped ${(d.by_status||{}).skipped||0}</span>
          <span class="badge-pill">Pending ${h.pending_count||0}</span>
        </div>
      </div>
      <details class="crm-strategy-details">
        <summary class="caption-uppercase">Cohort strategy</summary>
        <pre class="body-sm muted" style="white-space:pre-wrap">${e.esc(JSON.stringify(L,null,2))}</pre>
      </details>
      ${M?`<div class="crm-company-review driver-card outreach-company-review">
        <div class="human-panel__head">
          <h4 class="title-sm">${e.esc(R)}</h4>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-skip-company="${M.company_id}">Skip company</button>
        </div>
        <p class="body-sm muted">${e.esc(j.sector||M.sector||"")}</p>
        ${j.crm_research_summary?`<p class="body-sm">${e.esc(String(j.crm_research_summary).slice(0,400))}</p>`:""}
        ${(j.web_hits||[]).length?`<p class="caption-uppercase">Web signals</p><ul class="list-plain">${j.web_hits.slice(0,3).map(V=>`<li class="body-sm">${e.esc(V.snippet||V.title||"")}${V.url?` <a href="${e.esc(V.url)}" target="_blank" rel="noopener">link</a>`:""}</li>`).join("")}</ul>`:""}
        ${(j.vault_files_used||[]).length?`<p class="caption-uppercase">Vault files used</p><ul class="list-plain">${j.vault_files_used.map(V=>`<li class="body-sm">${e.esc(V.title||"doc #"+V.doc_id)}</li>`).join("")}</ul>`:""}
      </div>`:""}
      ${g.length?'<p class="caption-uppercase">Email drafts</p>':""}
      ${g.map(H).join("")}
      ${_.length?'<p class="caption-uppercase" style="margin-top:var(--space-md)">WhatsApp drafts</p>':""}
      ${_.map(H).join("")}
      ${!n.length&&M?'<p class="muted">No drafts for this company \u2014 contacts may lack email or WhatsApp allowlist.</p>':""}
    </section>`}function z(h){e.state.ui||(e.state.ui={});let w=[];if(h)try{let L=localStorage.getItem(`fos_outreach_sel_${h}`),M=L?JSON.parse(L):[];w=Array.isArray(M)?M.filter(j=>Number.isFinite(j)):[]}catch{}e.state.ui.crmOutreachSelected=w,e.state.ui.crmOutreachDraft=[...w]}function X(){o();let h=e.state._crmCampaigns?.campaigns||[],w=S(),L=D(),M=b(),j=new Set(p()),n=a().length,d=u(),_=((e.state.worlds||e.state._worldFull?.worlds||{}).children||[]).length>0,R=e.state._crmCompaniesLoading,N=e.state._crmCompaniesError,B=L.map(T=>{let ee=j.has(T.id),Z=T.contact_count||0,x=`${T.name||""} ${T.sector||""}`.trim();return`<label class="outreach-company-row human-field--checkbox${ee?" is-selected":""}" data-search="${e.esc(x)}">
        <input type="checkbox" data-crm-company-toggle="${T.id}" ${ee?"checked":""} ${j.size>=M&&!ee?"disabled":""}>
        <span class="outreach-company-row__main">
          <span class="outreach-company-row__name">${e.esc(T.name)}</span>
          <span class="outreach-company-row__meta muted">${e.esc(T.sector||"\u2014")} \xB7 ${Z} contact${Z===1?"":"s"}</span>
        </span>
      </label>`}).join(""),H=[5,10,15,20].map(T=>`<option value="${T}"${M===T?" selected":""}>${T}</option>`).join(""),V=h.slice(0,12).map(T=>`<tr>
        <td><button type="button" class="${T.status==="review"?"button-primary":"button-tertiary-text"} button-sm" data-crm-campaign="${T.id}">${e.esc(T.name)}</button></td>
        <td><span class="badge-pill badge-pill--${e.esc(T.status)}">${e.esc(T.status)}</span></td>
        <td class="muted">${e.esc((T.created_at||"").slice(0,10))}</td>
        <td>${T.status==="review"?`<button type="button" class="button-outline-on-dark button-sm" data-crm-campaign="${T.id}">Continue review</button>`:""}</td>
      </tr>`).join("")||'<tr><td colspan="4" class="muted">No campaigns yet</td></tr>',W=L.length?`<div id="outreach-company-picker" class="outreach-company-picker">
          <div class="outreach-picker-toolbar">
            <div class="outreach-picker-toolbar__head">
              <p class="caption-uppercase">Companies</p>
              <div class="outreach-picker-toolbar__counts">
                <span class="outreach-count-pill" title="Currently selected (not yet saved)">
                  <strong id="outreach-draft-count">${j.size}</strong><span class="muted" id="outreach-batch-max"> / ${M}</span>
                </span>
                <span class="outreach-count-pill outreach-count-pill--saved" title="Saved for this campaign">
                  <strong id="outreach-saved-count">${n}</strong> saved
                </span>
                <span id="outreach-selection-dirty" class="outreach-dirty-badge"${d?"":" hidden"}>Unsaved</span>
              </div>
            </div>
            <div class="outreach-select-meter" id="outreach-select-meter" role="progressbar" aria-valuenow="${j.size}" aria-valuemin="0" aria-valuemax="${M}" aria-label="Selection progress">
              <div class="outreach-select-meter__fill" style="width:${Math.min(100,j.size/M*100)}%"></div>
            </div>
            <p class="body-sm muted" id="outreach-batch-hint">${j.size>=M?`Batch limit reached (${M})`:`Pick up to ${M}, then save`}</p>
            <div class="outreach-picker-toolbar__actions">
              <input type="search" id="outreach-company-search" class="text-input-on-dark outreach-company-search" placeholder="Filter companies\u2026" autocomplete="off">
              <button type="button" id="outreach-save-companies" class="button-outline-on-dark button-sm" data-outreach-save-companies ${d&&j.size?"":"disabled"}>Save selection</button>
            </div>
          </div>
          <div class="outreach-company-list">${B}</div>
        </div>`:`<div class="crm-outreach-empty">
          <p class="body-md">No prospect companies for this world.</p>
          <p class="body-sm muted">Import from CRM contacts or add companies manually, then return here to build a batch.</p>
          <div class="human-form__actions">
            <button type="button" class="button-primary button-sm" data-outreach-open-crm-companies>Open companies in CRM</button>
          </div>
        </div>`,Q=n>0&&w!=="root"&&!d;return`<section class="driver-card span-12 human-panel outreach-setup">
      <div class="human-panel__head">
        <div>
          <h3 class="title-sm">Batch outreach</h3>
          <p class="body-sm muted">Pick companies, save your batch, then start \u2014 research and drafts run in the background.</p>
        </div>
      </div>
      ${e.renderOutreachSteps("setup")}
      ${_?"":'<p class="crm-outreach-warn">Create a sub-world under <strong>World</strong> first \u2014 outreach needs a venture context for vault research.</p>'}
      ${N?`<p class="crm-draft-error">${e.esc(N)}</p>`:""}
      <form class="human-form outreach-setup-form" id="crm-outreach-form">
        <div class="outreach-setup-grid">
          <label class="human-field"><span class="caption-uppercase">World</span>
            <select class="text-input-on-dark" name="world_id" id="crm-outreach-world">${e.renderWorldOptionsForCrm(w)}</select></label>
          <label class="human-field"><span class="caption-uppercase">Batch size</span>
            <select class="text-input-on-dark" name="batch_size" id="crm-outreach-batch">${H}</select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Outreach brief</span>
          <textarea class="text-input-on-dark outreach-auto-textarea" name="brief" rows="1" placeholder="e.g. Indian manufacturing SMBs \u2014 energy cost savings, 15-min discovery call, direct tone"></textarea></label>
        ${R?'<p class="muted body-sm">Loading companies\u2026</p>':W}
        <div class="human-form__actions outreach-setup-actions">
          <button type="submit" id="outreach-start-btn" class="button-primary" ${Q?"":"disabled"}${d?' title="Save your company selection before starting"':n?"":' title="Select and save at least one company"'}>
            Start outreach${n?` (${n} companies)`:""}
          </button>
        </div>
      </form>
      <section class="outreach-history">
        <p class="caption-uppercase">Recent campaigns</p>
        <div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${V}</tbody></table></div>
      </section>
    </section>`}function ae(){let h=e.outreachStep(),w=e.state._crmCampaignReview;return h==="running"?e.renderOutreachRunningPanel():h==="complete"&&w?.campaign?e.renderOutreachCompletePanel(w):h==="review"&&w?.campaign?e.renderOutreachReviewPanel(w):e.renderOutreachSetupPanel()}function K(){return`<div class="dashboard-grid">
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
    </div>`}async function C(){e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld||(e.state.ui.crmOutreachWorld=e.currentWorldId());let h=e.outreachWorldId(),w=h&&h!=="root"?`?world_id=${encodeURIComponent(h)}&include_unassigned=1`:"?include_unassigned=1",L=h&&h!=="root"?`?world_id=${encodeURIComponent(h)}`:"",M=e.routeParams?.campaignId||e.state.ui?.crmCampaignId;e.state._crmCompaniesLoading=!0,e.state._crmCompaniesError=null;try{let[j,n]=await Promise.all([e.api(`/crm/companies${w}`),e.api(`/crm/outreach/campaigns${L}`).catch(()=>({campaigns:[]}))]);if(e.state._crmCompanies=j,e.state._crmCampaigns=n,M||Array.isArray(e.state.ui.crmOutreachDraft)||(a().length?e.state.ui.crmOutreachDraft=[...a()]:z(h)),M){e.state.ui.crmCampaignId=M;let[d,g]=await Promise.all([e.api(`/crm/outreach/campaigns/${M}`).catch(()=>null),e.api(`/crm/outreach/campaigns/${M}/review`).catch(()=>null)]);e.state._crmCampaignDetail=d,e.state._crmCampaignReview=g?.campaign?g:d?.review;let _=e.state._crmCampaignReview?.campaign||d?.campaign;_&&["researching","drafting","created"].includes(_.status)?(e.state._crmOutreachJob={active:!0,phase:_.status,status:_.status},e.state._crmOutreachPollId||e.pollCrmOutreachJob(M)):_?.status==="review"&&(e.state._crmOutreachJob={phase:"Ready for review",active:!1})}}catch(j){e.state._crmCompaniesError=j.message||"Could not load outreach data"}finally{e.state._crmCompaniesLoading=!1}}async function r(h){let w=new FormData(h),L=(w.get("world_id")||"").toString().trim(),M=parseInt(w.get("batch_size")||"5",10)||5,j=(w.get("brief")||"").toString().trim(),n=a();if(u())return alert("Save your company selection before starting.");if(!L||L==="root")return alert("Select a sub-world for outreach (not Main world).");if(!n.length)return alert("Select and save at least one company.");if(!j)return alert("Add a brief so the agent knows what kind of message to write.");try{let d=await e.api("/crm/outreach/campaigns",{method:"POST",body:JSON.stringify({world_id:L,batch_size:M,brief:j,company_ids:n})});await e.api(`/crm/outreach/campaigns/${d.campaign_id}/start`,{method:"POST"}),e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=[],e.state.ui.crmOutreachDraft=[];try{localStorage.removeItem(`fos_outreach_sel_${L}`)}catch{}e.goView("outreach",{params:{campaignId:d.campaign_id}}),e.pollCrmOutreachJob(d.campaign_id)}catch(d){alert(d.message)}}async function c(h,w=!1){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId);let L=async()=>{try{let M=await e.api(`/crm/outreach/campaigns/${h}`),j=M.campaign||{},n=M.review||{},d=M.job||{};if(e.state._crmCampaignDetail=M,j.status==="review"||j.status==="done"||j.status==="failed"){e.state._crmOutreachJob={active:!1,phase:j.status==="review"?"Ready for review":j.status},e.state._crmCampaignReview=n.campaign?n:await e.api(`/crm/outreach/campaigns/${h}/review`),e.state._crmOutreachPollId=null,e.currentView==="outreach"&&e.render();return}e.state._crmOutreachJob={active:!0,phase:d.phase||j.status||"running\u2026",status:j.status},e.currentView==="outreach"&&e.render(),w||(e.state._crmOutreachPollId=setTimeout(L,2500))}catch{w||(e.state._crmOutreachPollId=setTimeout(L,4e3))}};w?await L():e.state._crmOutreachPollId=setTimeout(L,500)}async function $(h){h&&e.goView("outreach",{params:{campaignId:parseInt(h,10)}})}function A(){e.state._crmOutreachPollId&&clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null,e.state.ui&&(e.state.ui.crmCampaignId=null),e.state._crmCampaignReview=null,e.state._crmCampaignDetail=null,e.state._crmOutreachJob=null,e.goView("outreach",{params:{}})}function E(h){s(h)}async function F(h){let w=e.state.ui?.crmCampaignId;if(!(!w||!h)&&confirm("Skip all pending messages for this company?"))try{await e.api(`/crm/outreach/campaigns/${w}/companies/${h}/skip`,{method:"POST"}),e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${w}/review`),e.render()}catch(L){alert(L.message)}}async function q(h){let w=document.querySelector(`.crm-draft-subject[data-draft-id="${h}"]`),L=document.querySelector(`.crm-draft-body[data-draft-id="${h}"]`),M={};w&&(M.subject=w.value),L&&(M.body=L.value),Object.keys(M).length&&await e.api(`/crm/outreach/drafts/${h}`,{method:"PATCH",body:JSON.stringify(M)})}async function Y(h){if(h)try{await e.saveCrmDraftEdits(h);let w=await e.api(`/crm/outreach/drafts/${h}/approve-send`,{method:"POST"});if(w.error)return alert(w.error);let L=e.state.ui?.crmCampaignId;L&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${L}/review`)),e.render()}catch(w){alert(w.message)}}async function te(h){if(h)try{await e.api(`/crm/outreach/drafts/${h}/skip`,{method:"POST"});let w=e.state.ui?.crmCampaignId;w&&(e.state._crmCampaignReview=await e.api(`/crm/outreach/campaigns/${w}/review`)),e.render()}catch(w){alert(w.message)}}e.outreachWorldId=S,e.outreachStep=k,e.draftApproveDisabledReason=y,e.renderOutreachSteps=O,e.renderOutreachRunningPanel=P,e.renderOutreachCompletePanel=G,e.renderOutreachReviewPanel=J,e.renderOutreachSetupPanel=X,e.renderOutreachBody=ae,e.renderOutreach=K,e.loadOutreachData=C,e.submitCrmOutreach=r,e.pollCrmOutreachJob=c,e.openCrmCampaignReview=$,e.closeCrmCampaignReview=A,e.fitOutreachTextarea=I,e.fitAllOutreachTextareas=v,e.toggleOutreachDraftCompany=s,e.saveOutreachCompanySelection=l,e.setOutreachBatchSize=i,e.filterOutreachCompanyList=f,e.syncOutreachCompanyPickerUi=t,e.restoreOutreachSelectionForWorld=z,e.resetOutreachCompanySelection=m,e.toggleCrmOutreachCompany=E,e.skipCrmCompany=F,e.saveCrmDraftEdits=q,e.approveCrmDraft=Y,e.skipCrmDraft=te}function Ie(e){function S(){let u=e.state._goals||{},m=!!e.state.ui?.goalsFormOpen,o=!!e.state.ui?.reminderFormOpen,t=(u.active||[]).map(f=>`<li class="goal-row">
      <span><strong>${e.esc(f.title)}</strong>${f.detail?" \u2014 "+e.esc(f.detail):""}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goal-done="${f.id}">Done</button>
    </li>`).join("")||"<li class='muted'>No active goals \u2014 add one below.</li>",s=(e.state.tasks||[]).map(f=>`<li>${e.esc(f.title)} <span class="muted">P${f.priority||3}</span></li>`).join("")||"<li class='muted'>No open tasks</li>",l=(u.reminders||[]).map(f=>`<li class="reminder-row">
      <span>${e.esc(f.text)} <span class="muted">${e.esc((f.due_at||"").slice(0,16).replace("T"," "))}</span></span>
      <span class="reminder-row__actions">
        <button type="button" class="button-outline-on-dark button-sm" data-reminder-done="${f.id}">Done</button>
        <button type="button" class="button-tertiary-text button-sm" data-reminder-cancel="${f.id}">Cancel</button>
      </span>
    </li>`).join("")||"<li class='muted'>No reminders</li>",i=(u.plans||[]).map(f=>`<li>${e.esc(f.goal)}</li>`).join("")||"<li class='muted'>No open plans</li>";return`<div class="dashboard-grid">
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
      <section class="driver-card span-6"><p class="caption-uppercase">Open tasks</p><ul class="list-plain" style="margin-top:var(--space-sm)">${s}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Reminders</p><ul class="list-plain" style="margin-top:var(--space-sm)">${l}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Plans &amp; projects</p><ul class="list-plain" style="margin-top:var(--space-sm)">${i}</ul></section>
    </div>`}async function k(u){let m=new FormData(u),o=(m.get("title")||"").toString().trim();if(o)try{await e.api("/goals",{method:"POST",body:JSON.stringify({title:o,detail:(m.get("detail")||"").toString().trim(),priority:parseInt(m.get("priority")||"3",10)||3})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.goalsFormOpen=!1),await e.refresh(),e.render(),u.reset()}catch(t){alert(t.message)}}async function b(u){if(u)try{await e.api(`/goals/${encodeURIComponent(u)}`,{method:"PATCH",body:JSON.stringify({status:"done"})}),e.state._goals=await e.api("/goals"),await e.refresh(),e.render()}catch(m){alert(m.message)}}async function a(u){let m=new FormData(u),o=(m.get("text")||"").toString().trim(),t=(m.get("due_at")||"").toString().trim();if(!o||!t)return;let s=t.length===16?`${t}:00`:t;try{await e.api("/reminders",{method:"POST",body:JSON.stringify({text:o,due_at:s})}),e.state._goals=await e.api("/goals"),e.state.ui&&(e.state.ui.reminderFormOpen=!1),e.render(),u.reset()}catch(l){alert(l.message)}}async function p(u,m){if(await e.api(`/reminders/${u}`,{method:"PATCH",body:JSON.stringify({status:m}),timeoutMs:15e3}),e.state._goals=await e.api("/goals"),e.currentView==="goals"&&e.render(),e.currentView==="dashboard"){let o=e.currentWorldId(),t=o&&o!=="root"?`?world_id=${encodeURIComponent(o)}`:"";e.state._nudges=(await e.api(`/nudges${t}`).catch(()=>({nudges:[]}))).nudges||[],e.render()}}e.renderGoals=S,e.submitGoal=k,e.markGoalDone=b,e.submitReminder=a,e.updateReminderStatus=p}function Ae(e){function S(){let b=e.state._memoryResults||[],a=e.state._memoryFull||{},p=a.collections||[],u=a.knowledge_graph||{},m=b.map(t=>`<div class="memory-hit">
      <span class="badge-pill">${e.esc(t.collection)}</span>
      <p class="body-md" style="margin-top:var(--space-xxs);max-width:72ch">${e.esc(t.text)}</p></div>`).join(""),o=p.map(t=>`
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
      <div id="memory-tab-collections" ${e.memoryGraphTab!=="collections"?"hidden":""}>${o||"<p class='body-md'>No vector memory yet.</p>"}</div>
      <div id="memory-tab-search" ${e.memoryGraphTab!=="search"?"hidden":""}>
        <div id="memory-results">${m||'<p class="body-md">Search to find relevant memories.</p>'}</div>
      </div>`}async function k(){let b=e.$("#memory-q")?.value?.trim();if(e.state._memoryQ=b,!b)return;let a=await e.api("/memory/search?q="+encodeURIComponent(b));e.state._memoryResults=a.results,e.render()}e.renderMemory=S,e.searchMemory=k}function Oe(e){function S(a){let p=a.content||"";return a.role==="agent"||a.role==="assistant"?`<div class="msg-md history-msg__body">${window.FOSMarkdown?.render?.(p)||e.esc(p)}</div>`:`<p class="body-md history-msg__body">${e.esc(p)}</p>`}function k(){let p=(e.state._history||{}).sessions||[],u=e.state._artifacts||[],m=e.state._historySession,o=e.historyTab,t=p.length?p.map(i=>`
      <button type="button" class="history-session${m?.id===i.id?" is-active":""}" data-history-session="${e.esc(i.id)}">
        <span class="history-session__title">${e.esc(i.title||"Conversation")}</span>
        <span class="history-session__meta muted">${e.esc(i.specialist||"supervisor")} \xB7 ${i.message_count||0} msgs \xB7 ${e.fmtHistoryTime(i.updated_at)}</span>
      </button>`).join(""):"<p class='body-md muted'>No conversations yet. Ask the agent something to start a session.</p>",s="<p class='body-md muted'>Select a conversation to view messages, runs, and linked documents.</p>";if(m?.messages?.length){let i=m.messages.map(I=>`
        <div class="history-msg history-msg--${e.esc(I.role)}">
          <span class="caption-uppercase">${e.esc(I.role)}</span>
          ${e.renderHistoryMessageContent(I)}
          <span class="muted" style="font-size:11px">${e.fmtHistoryTime(I.created_at)}</span>
        </div>`).join(""),f=(m.runs||[]).map(I=>`
        <article class="history-run">
          <div class="history-run__head">
            <span class="mono">${e.esc(I.specialist||I.actor||"agent")}</span>
            <span class="muted">${I.duration_s||0}s</span>
          </div>
          ${e.renderLiveFlow((I.tools||[]).map(v=>({name:v.name,decision:v.decision,t:v.t})),"No tools")}
          ${I.assistant_reply?`<div class="history-run__reply msg-md">${window.FOSMarkdown?.render?.(I.assistant_reply)||e.esc(I.assistant_reply)}</div>`:""}
        </article>`).join("")||"",D=(m.artifacts||[]).map(I=>`
        <button type="button" class="history-doc-btn" data-open-document="${I.id}">
          <span class="badge-pill">${e.esc(I.kind)}</span>
          <span>${e.esc(I.title)}</span>
        </button>`).join("")||"<p class='muted'>No documents in this session.</p>";s=`
        <div class="history-detail__actions">
          <button type="button" class="button-primary button-sm" data-open-chat-session="${e.esc(m.id)}">Open in chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New conversation</button>
        </div>
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Messages</p>
        <div class="history-messages">${i}</div>
        ${f?`<p class="caption-uppercase" style="margin-top:var(--space-md)">Runs</p>${f}`:""}
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
        <button type="button" class="graph-tab ${o==="conversations"?"is-active":""}" data-history-tab="conversations">Conversations</button>
        <button type="button" class="graph-tab ${o==="documents"?"is-active":""}" data-history-tab="documents">Documents</button>
      </div>
      ${o==="conversations"?`<div class="history-layout">
        <section class="driver-card history-sessions">${t}</section>
        <section class="driver-card history-detail">${s}</section>
      </div>`:`<section class="driver-card history-documents-grid">${l}</section>`}`}async function b(a){e.state._historySelectedId=a;try{e.state._historySession=await e.api(`/history/sessions/${a}`)}catch{e.state._historySession=null}e.render()}e.renderHistoryMessageContent=S,e.renderHistory=k,e.loadHistorySession=b}function Le(e){function S(){let b=e.state.approvals||[];return b.length?`<section class="driver-card">${b.map(a=>`
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
    </div>`}e.renderActivity=S}function Te(e){function S(){let o=e.state._infraHealth;if(!o)return`<section class="driver-card span-12">
        <div class="infra-health-head">
          <p class="caption-uppercase">Infrastructure</p>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Check health</button>
        </div>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Monitor EC2 host, S3 vault bucket, and disk on this server.</p>
      </section>`;let t=o.host||{},s=o.s3||{},l=o.disk||{},i=o.app||{},f=t.platform==="ec2"?e.infraKvRow("Instance",t.instance_id,!0)+e.infraKvRow("Region",t.region)+e.infraKvRow("Type",t.instance_type)+e.infraKvRow("IAM role",t.iam_role):e.infraKvRow("Host","Local / dev"),D=s.configured?e.infraKvRow("Bucket",s.bucket,!0)+e.infraKvRow("Region",s.region)+e.infraKvRow("Read/write",s.read_write_ok?"OK":s.reachable?"Reachable only":"Failed"):e.infraKvRow("Storage","Local disk only"),I=e.infraKvRow("Data path",l.path,!0)+e.infraKvRow("Free",l.free_gb!=null?`${l.free_gb} GB`:null)+e.infraKvRow("Used",l.used_pct!=null?`${l.used_pct}%`:null),v=!!o.ok;return`<section class="driver-card span-12">
      <div class="infra-health-head">
        <div>
          <p class="caption-uppercase">Infrastructure</p>
          <p class="world-meta">Last checked ${e.esc(e.fmtTime(o.checked_at)||o.checked_at||"\u2014")} \xB7 App storage: <strong>${e.esc(i.storage_backend||"\u2014")}</strong></p>
        </div>
        <div class="infra-health-head__actions">
          <span class="badge-pill${v?" badge-pill--ok":" badge-pill--warn"}">${v?"All checks passed":"Needs attention"}</span>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Refresh</button>
        </div>
      </div>
      <div class="infra-health-grid">
        ${e.infraHealthCard("EC2 host",t.ok!==!1,f,t.detail)}
        ${e.infraHealthCard("S3 vault",s.configured?!!s.ok:!0,D,s.detail)}
        ${e.infraHealthCard("Disk",!!l.ok,I,l.detail)}
      </div>
    </section>`}function k(){let o=e.state.config||{},t=o.integrations||{},s=e.state._whatsapp||{},l=(o.autonomy_level||"balanced").toLowerCase(),i=o.whatsapp_enabled?s.connected?`Connected${s.linked_phone?` (${e.esc(s.linked_phone)})`:""}`:s.qr_pending?"Scan QR below":"Bridge not connected":"Disabled in .env",f=s.qr_data_url?`<img src="${s.qr_data_url}" alt="WhatsApp QR code" width="280" height="280" style="margin-top:var(--space-sm);border-radius:8px">`:"",D=o.agent_paused?'<button type="button" class="button-primary" id="toggle-pause">Resume agent</button>':'<button type="button" class="button-outline-on-dark" id="toggle-pause">Pause agent</button>';return`<div class="dashboard-grid settings-page">
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
            ${D}
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
          ${e.integrationCard("WhatsApp",t.whatsapp&&s.connected,"Allowlisted CRM contacts only; every send needs approval")}
        </div>
      </section>
      ${o.whatsapp_enabled?`<section class="driver-card span-12 human-panel" id="whatsapp-settings-panel">
        <p class="section-eyebrow">WhatsApp</p>
        <h3 class="title-sm">Linked device</h3>
        <p class="body-md muted">Personal WhatsApp via Baileys (unofficial). Only contacts you allow in CRM are stored or messaged. Outbound always requires your approval.</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Status</dt><dd>${i}</dd></div>
          <div class="settings-kv__row"><dt>Allowlisted</dt><dd>${s.allowlist_count??s.allowlist_size??"\u2014"} contacts</dd></div>
        </dl>
        ${f}
        <p class="caption muted" style="margin-top:var(--space-xs)">Open WhatsApp \u2192 Linked devices \u2192 Link a device. QR refreshes every few seconds while pending.</p>
      </section>`:""}
    </div>`}function b(){e.whatsappPollTimer&&(clearInterval(e.whatsappPollTimer),e.whatsappPollTimer=null)}async function a(){if(e.currentView!=="settings"){e.stopWhatsappPoll();return}try{let o=await e.api("/whatsapp/status");if(e.state._whatsapp={...e.state._whatsapp||{},...o},o.qr_pending){let t=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=t.qr_data_url||null}else e.state._whatsapp.qr_data_url=null;e.currentView==="settings"&&e.render({graphs:!1})}catch{}}function p(){e.stopWhatsappPoll();let o=e.state.config||{};e.currentView!=="settings"||!o.whatsapp_enabled||(e.pollWhatsappSettings(),e.whatsappPollTimer=setInterval(a,5e3))}async function u(){let o=document.getElementById("btn-infra-refresh");o&&(o.disabled=!0);try{e.state._infraHealth=await e.api("/infrastructure/health"),e.render(),e.afterRender()}catch(t){console.error("Infrastructure health check failed:",t)}finally{o&&(o.disabled=!1)}}async function m(o){let t=new FormData(o);try{let s=await e.api("/agent/config",{method:"POST",body:JSON.stringify({autonomy_level:(t.get("autonomy_level")||"balanced").toString(),auto_approve:t.get("auto_approve")==="1"})});e.state.config={...e.state.config||{},...s},e.updateStatus(),e.render()}catch(s){alert(s.message)}}e.renderInfrastructureHealth=S,e.renderSettings=k,e.stopWhatsappPoll=b,e.pollWhatsappSettings=a,e.startWhatsappPollIfNeeded=p,e.refreshInfraHealth=u,e.saveAgentConfig=m}function Pe(e){function S(v){let y={name:"",dirs:{},files:[]};for(let O of v){let P=O.github_path||O.filename||O.title||"file",G=P.split("/").filter(Boolean),J=G.pop()||P,z=y;for(let X of G)z.dirs[X]||(z.dirs[X]={name:X,dirs:{},files:[]}),z=z.dirs[X];z.files.push({...O,_fileName:J})}return y}function k(){return document.hidden?e.LIVE_POLL_HIDDEN_MS:e.LIVE_POLL_MS}function b(){e.livePollTimer&&clearTimeout(e.livePollTimer),e.livePollTimer=setTimeout(async()=>{await e.pollLive(),e.scheduleLivePoll()},e.livePollDelayMs())}function a(v){return e.WORLD_KINDS[v]||e.WORLD_KINDS.project}function p(v){let y=e.worldKindMeta(v||"project");return`<span class="world-kind-badge ${y.cls}">${e.esc(y.label)}</span>`}function u(){return e.state._worldFull?.worlds||e.state.worlds||{}}function m(v){e.currentView==="world"&&e.inspectorWorldId()===v?e.patchWorldPanels():e.currentView==="agents"&&e.currentWorldId()===v?e.patchAgentsVaultPanel():e.render({graphs:!1})}function o(){return(e.state._worldVault?.storage_backend||e.state._worldVault?.vault?.storage_backend)==="s3"?"S3":"local object storage"}function t(v){let y=Number(v)||0;return y<1024?`${y} B`:y<1048576?`${(y/1024).toFixed(1)} KB`:`${(y/1048576).toFixed(1)} MB`}function s(v){if(!v)return"";let y=typeof v=="number"?new Date(v*1e3):new Date(v);return Number.isNaN(y.getTime())?String(v).slice(0,16):y.toLocaleString()}function l(v,y,O=!1){let P=y==null||y===""?"\u2014":String(y);return`<div class="infra-kv"><dt>${e.esc(v)}</dt><dd${O?' class="infra-kv__val"':""}>${e.esc(P)}</dd></div>`}function i(v,y,O,P){let G=y?"Healthy":"Issue";return`<div class="integration-card infra-health-card${y?" is-connected":" is-warning"}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(v)}</span>
        <span class="integration-card__status">${G}</span>
      </div>
      <dl class="infra-kv-list">${O}</dl>
      ${P?`<p class="integration-card__detail">${e.esc(P)}</p>`:""}
    </div>`}function f(v,y,O){return`<div class="integration-card${y?" is-connected":""}">
      <div class="integration-card__head">
        <span class="title-sm">${e.esc(v)}</span>
        <span class="integration-card__status">${y?"Active":"Not configured"}</span>
      </div>
      <p class="integration-card__detail">${e.esc(O)}</p>
    </div>`}async function D(v){let y=v.target.files?.[0];if(!y)return;let O=new FormData;O.append("file",y),e.chatHistory.push({role:"user",text:`\u{1F4CE} Uploaded: ${y.name}`}),e.render();try{O.append("world_id",e.currentWorldId());let P=await fetch("/api/upload",{method:"POST",body:O,credentials:"same-origin"}),G=await P.json().catch(()=>({}));if(P.status===401&&G.pin_required)throw e.showPinGate(),new Error("Enter your PIN to continue");if(!P.ok)throw new Error(G.error||P.statusText);e.chatHistory.push({role:"agent",text:G.reply})}catch(P){e.chatHistory.push({role:"system",text:"Upload failed: "+P.message})}localStorage.setItem("fos_chat",JSON.stringify(e.chatHistory)),v.target.value="",e.render()}function I(){let v=document.querySelector(".app"),y=e.$("#btn-sidebar-collapse"),O="fos_sidebar_collapsed";localStorage.getItem(O)==="1"&&v?.classList.add("sidebar-collapsed");let P=()=>{let G=v?.classList.contains("sidebar-collapsed");y?.setAttribute("aria-label",G?"Expand sidebar":"Collapse sidebar"),y?.setAttribute("title",G?"Expand sidebar":"Collapse sidebar")};P(),y?.addEventListener("click",()=>{v?.classList.toggle("sidebar-collapsed"),localStorage.setItem(O,v?.classList.contains("sidebar-collapsed")?"1":"0"),P()})}e.buildGithubPathTree=S,e.livePollDelayMs=k,e.scheduleLivePoll=b,e.worldKindMeta=a,e.worldKindBadge=p,e.worldTreeData=u,e.afterVaultMutation=m,e.vaultStorageLabel=o,e.formatBytes=t,e.fmtHistoryTime=s,e.infraKvRow=l,e.infraHealthCard=i,e.integrationCard=f,e.uploadFile=D,e.initSidebarCollapse=I}function Ee(e){async function S(p){if(p==="crm"&&await e.loadCrmData(),p==="outreach"&&await e.loadOutreachData(),p==="settings"&&(e.state._whatsapp=await e.api("/whatsapp/status").catch(()=>({})),e.state._whatsapp.qr_pending)){let u=await e.api("/whatsapp/qr").catch(()=>({}));e.state._whatsapp.qr_data_url=u.qr_data_url||null}if(p==="goals"&&(e.state._goals=await e.api("/goals")),p==="tools"&&(e.state._tools=await e.api("/tools")),p==="agents"){let[u,m,o,t,s]=await Promise.all([e.api("/agents"),e.api("/activity").catch(()=>({})),e.api("/agents/runs").catch(()=>({runs:[],actions:[]})),e.api("/crm/contacts").catch(()=>({})),e.api("/tools").catch(()=>({}))]);e.state._agents=u,e.state._agents?.specialists?.length||(e.state._agents={...e.state._agents,specialists:e.DEFAULT_SPECIALISTS}),e.state._activity=m,e.state._agentRunsApi=o.runs||[],e.state._agentActions=o.actions||m.actions||[],e.state._crm=t,e.state._tools=s;let l=e.currentWorldId();l&&l!=="root"?await e.ensureVaultForWorld(l):e.clearVaultScopedState()}if(p==="settings"&&(e.state._infraHealth=await e.api("/infrastructure/health").catch(()=>e.state._infraHealth||null)),p==="activity"&&(e.state._activity=await e.api("/activity")),p==="history"){let u=e.currentWorldId(),m=u&&u!=="root"?`?world_id=${encodeURIComponent(u)}`:"";e.state._history=await e.api(`/history${m}`).catch(()=>({sessions:[],recent_runs:[]})),e.state._artifacts=(await e.api(`/artifacts${m}`).catch(()=>({artifacts:[]}))).artifacts||[],e.state._historySelectedId?e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null):e.state._history.sessions?.[0]&&(e.state._historySelectedId=e.state._history.sessions[0].id,e.state._historySession=await e.api(`/history/sessions/${e.state._historySelectedId}`).catch(()=>null))}if(p==="documents")if(e.state._artifacts=(await e.api("/artifacts?limit=100").catch(()=>({artifacts:[]}))).artifacts||[],e.state._documentsSelectedId)try{let u=await e.api(`/artifacts/${e.state._documentsSelectedId}/content`,{timeoutMs:15e3});e.state._documentDraft=u.content||""}catch{e.state._documentDraft=""}else e.state._documentDraft="";if(p==="world"&&(e.state._worldFull=await e.api("/graph/world"),e.state._worldGraph=e.state._worldFull?.graph??null,e.state._worldHierarchyGraph=e.state._worldFull?.hierarchy_graph??null,e.state._worldPreviews=e.state._worldFull?.world_previews||{},e.invalidateGraphCache("graph-world"),e.state._worldTemplates?.length||(e.state._worldTemplates=(await e.api("/world-templates").catch(()=>({}))).templates||[]),e.state.inspectorWorldId||(e.state.inspectorWorldId=e.currentWorldId()),e.state._githubStatus=await e.api("/github/status").catch(()=>({})),e.state._githubStatus?.connected?e.state._githubRepos=(await e.api("/github/repos").catch(()=>({}))).repos||[]:e.state._githubRepos=[],await e.ensureVaultForWorld(e.inspectorWorldId()),await e.resumeActiveSyncJobs(e.inspectorWorldId())),p==="memory"&&(e.state._memoryFull=await e.api("/graph/memory"),e.state._memoryGraph=e.state._memoryFull?.graph??null,e.invalidateGraphCache("graph-memory")),(p==="dashboard"||p==="chat"||p==="agents")&&(e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})))),p==="chat"){e.state._activity=await e.api("/activity").catch(()=>e.state._activity||{}),e.state._agentRunsApi=(await e.api("/agents/runs").catch(()=>({}))).runs||e.state._agentRunsApi,await e.loadChatSessionsList(),await e.loadChatFromServer();let u=e.currentWorldId();u&&u!=="root"&&await e.ensureVaultForWorld(u)}if(p==="dashboard"){e.state._world=await e.api("/world").catch(()=>e.state._world||{}),e.state._worldGraph=e.state._world?.graph??e.state._worldGraph??null,e.state._agents?.specialists?.length||(e.state._agents=await e.api("/agents").catch(()=>({specialists:e.DEFAULT_SPECIALISTS})));let u=e.currentWorldId(),m=u&&u!=="root"?`?world_id=${encodeURIComponent(u)}`:"";e.state._nudges=(await e.api(`/nudges${m}`).catch(()=>({nudges:[]}))).nudges||[]}["dashboard","agents","chat","world","memory"].includes(p)&&await e.loadGraphData()}async function k(p=!1){let u=e.state.activeWorldId,m=e.state.selectedSpecialist,o=e.state.ui;if(p||!e.state.config?.my_name)e.state={...e.state,...await e.api("/state")};else{let t=await e.api("/summary");e.state.usage=t.usage??e.state.usage,e.state.unread_notifications=t.unread_notifications??e.state.unread_notifications,t.worlds&&(e.state.worlds=t.worlds),t.config&&(e.state.config=t.config),e.state.snapshot={...e.state.snapshot||{},approvals_pending:t.approvals_pending??e.state.snapshot?.approvals_pending??0,reminders_pending:t.reminders_pending??e.state.snapshot?.reminders_pending??0,tasks_open:t.tasks_open??e.state.snapshot?.tasks_open??0,crm:{...e.state.snapshot?.crm||{},followups_due:t.crm_followups_due??e.state.snapshot?.crm?.followups_due??0}}}e.state.activeWorldId=u||e.state.activeWorldId||"root",e.state.selectedSpecialist=m??e.state.selectedSpecialist??"",e.state.ui=o||e.state.ui;try{e.populateWorldSelect(),e.populateSpecialistSelect()}catch(t){console.error("populate selects failed:",t)}e.updateBadges(),e.updateStatus(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function b(){}function a(){e.refreshTimer&&clearTimeout(e.refreshTimer),!document.hidden&&(e.refreshTimer=setTimeout(async()=>{try{await e.refresh(!1),e.updateBadges(),e.updateStatus()}catch(p){console.error(p),e.setConnectionStatus("Reconnecting\u2026","paused")}e.scheduleBackgroundRefresh()},e.REFRESH_MS))}e.loadViewData=S,e.refresh=k,e.loadBootExtras=b,e.scheduleBackgroundRefresh=a}function We(e){function S(){return window.FOS_MOBILE_PRIMARY_VIEWS||new Set(["dashboard","chat","agents","world"])}function k(){document.getElementById("sidebar")?.classList.remove("is-open"),document.body.classList.remove("mobile-nav-open");let i=document.getElementById("sidebar-backdrop");i&&(i.classList.remove("is-visible"),i.setAttribute("hidden","")),document.getElementById("mobile-menu-drawer")?.close?.()}function b(){let i=document.getElementById("sidebar"),f=document.getElementById("sidebar-backdrop");!i||!f||(i.classList.add("is-open"),document.body.classList.add("mobile-nav-open"),f.removeAttribute("hidden"),requestAnimationFrame(()=>f.classList.add("is-visible")))}function a(i){let f=e.mobilePrimaryViews();document.querySelectorAll(".mobile-tab").forEach(D=>{let I=D.dataset.mobileView;I==="more"?D.classList.toggle("is-active",!f.has(i)):D.classList.toggle("is-active",I===i)}),document.querySelectorAll(".mobile-menu-link").forEach(D=>{D.classList.toggle("is-active",D.dataset.view===i)})}function p(i,f={}){let D=f.params??(i===e.currentView?e.routeParams:{})??{};f.skipUrl?e.applyRouteParams(i,D):e.updateRoute(i,D,{replace:!!f.replace}),e.currentView=i,i!=="outreach"&&e.state._crmOutreachPollId&&(clearTimeout(e.state._crmOutreachPollId),e.state._crmOutreachPollId=null),e.$$(".nav button").forEach(v=>v.classList.toggle("is-active",v.dataset.view===i)),e.$("#view-title").textContent=e.TITLES[i]||i,e.syncMobileNav(i),e.closeMobileShell(),FOSMotion?.animateTopbarTitle?.(),["dashboard","agents","chat","activity","world"].includes(i)?e.startLivePoll():e.stopLivePoll();let I=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1}),e.loadViewData(i).then(()=>{I===e.viewDataLoadGen&&(e.setViewLoading(!1),e.render())}).catch(v=>{console.error(v),I===e.viewDataLoadGen&&e.setViewLoading(!1)})}function u(i={}){try{e.currentView==="dashboard"&&e.drawDashboardCharts()}catch(v){console.warn("dashboard charts skipped:",v)}try{i.graphs!==!1&&e.drawGraphs()}catch(v){console.warn("graphs skipped:",v)}e.state._motionSkipOnce?e.state._motionSkipOnce=!1:FOSMotion?.runView?.(e.currentView),FOSMotion?.ensureContentVisible?.();let f=document.getElementById("content"),D=window.FOSMarkdown?.enhance?.(f),I=()=>{(e.currentView==="chat"||e.currentView==="agents")&&e.initMsgReadMore(f)};if(D?.then?D.then(I).catch(I):I(),e.currentView==="documents"&&!e.documentsEditMode){let v=e.$("#docs-preview");v&&window.FOSMarkdown?.renderInto?.(v,e.state._documentDraft??"")}e.startWhatsappPollIfNeeded(),e.currentView==="outreach"&&e.outreachStep?.()==="setup"&&(e.syncOutreachCompanyPickerUi?.(),e.fitAllOutreachTextareas?.()),e.currentView==="outreach"&&e.outreachStep?.()==="review"&&e.fitAllOutreachTextareas?.()}function m(){let i=(e.state.approvals||[]).length,f=e.$("#nav-approval-badge");f&&(f.textContent=i,f.hidden=!i);let D=e.$("#mobile-approval-badge");D&&(D.textContent=i,D.hidden=!i);let I=e.$("#mobile-menu-approval-badge");I&&(I.textContent=i,I.hidden=!i);let v=e.state.unread_notifications||0,y=e.$("#notif-badge");y&&(y.textContent=v,y.hidden=!v)}function o(i,f="ok"){let D=e.$("#status-dot"),I=e.$("#status-text"),v=e.$("#mobile-status-dot"),y=e.$("#mobile-status-text");I&&(I.textContent=i),y&&(y.textContent=i),D?.classList.toggle("ok",f==="ok"),D?.classList.toggle("paused",f!=="ok"),v?.classList.toggle("ok",f==="ok"),v?.classList.toggle("paused",f!=="ok")}function t(){let i=e.state.config||{};i.agent_paused?e.setConnectionStatus("Agent paused","paused"):e.setConnectionStatus("Online","ok");let f=e.$("#brand-sub");f&&(f.textContent=i.my_name||i.company_name||e.APP_NAME),document.title=i.my_name?`${e.APP_NAME} \u2014 ${i.my_name}`:e.APP_NAME}async function s(i,f){f&&(await e.api(`/notifications/${encodeURIComponent(f)}/read`,{method:"POST"}).catch(()=>{}),await e.refresh(),e.updateBadges()),i==="approvals"?e.goView("approvals"):i==="crm"?e.goView("crm"):i==="outreach"?e.goView("outreach"):i==="goals"?e.goView("goals"):i==="chat"?e.goView("chat"):e.goView(i||"dashboard"),e.$("#notif-drawer")?.close()}function l(){let i=e.state.notifications||[];e.$("#notif-list").innerHTML=i.length?i.map(f=>{let D=f.meta?.action||(f.kind==="approval"?"approvals":f.kind==="agent"?"chat":""),I=D?`<button type="button" class="button-outline-on-dark button-sm" data-notif-action="${e.esc(D)}" data-notif-id="${e.esc(f.id)}" style="margin-top:8px">Open</button>`:"",v=f.meta?.url,y=!I&&v?`<a class="button-outline-on-dark button-sm" href="${e.esc(v)}" target="_blank" rel="noopener" style="margin-top:8px;display:inline-block">Open</a>`:"";return`
      <div class="notif-item ${f.read?"":"unread"}" data-notif-id="${e.esc(f.id)}">
        <div class="title">${e.esc(f.title)}</div>
        <div class="body">${e.esc(f.body)}</div>
        <div class="muted" style="font-size:11px;margin-top:4px">${e.fmtTime(f.ts)}</div>
        ${I||y}
      </div>`}).join(""):"<p class='muted'>No notifications yet.</p>"}e.mobilePrimaryViews=S,e.closeMobileShell=k,e.openSidebar=b,e.syncMobileNav=a,e.goView=p,e.afterRender=u,e.updateBadges=m,e.setConnectionStatus=o,e.updateStatus=t,e.openNotificationAction=s,e.renderNotifications=l}function Me(e){function S(){let k=document.getElementById("content");!k||k.dataset.delegation==="1"||(k.dataset.delegation="1",k.addEventListener("click",b=>{let a=b.target.closest("[data-operator],[data-toggle-ui],[data-goto],[data-approve],[data-reject],[data-select-specialist],[data-agents-tab],[data-toggle-run],[data-memory-tab],[data-inspect-world],[data-world-graph-tab],[data-use-world],[data-set-active-world],[data-edit-world],[data-cancel-edit],[data-delete-world],[data-vault-ingest],[data-vault-link],[data-vault-search],[data-vault-facet],[data-vault-add-doc],[data-vault-cancel-doc],[data-vault-edit-doc],[data-vault-delete-doc],[data-vault-view-doc],[data-vault-reload],[data-github-add],[data-github-sync],[data-github-unlink],[data-goal-done],[data-history-tab],[data-history-session],[data-open-chat-session],[data-new-chat-session],[data-chat-session],[data-cancel-job],[data-cancel-active-job],[data-md-artifact],[data-open-document],[data-select-document],[data-docs-action],[data-tag-vault-doc],[data-nudge-index],[data-remove-attachment],[data-open-vault-picker],[data-pick-vault-doc],[data-crm-followup],[data-crm-wa-thread],[data-crm-tab],[data-crm-company-detail],[data-crm-company-close],[data-crm-import-companies],[data-crm-reload],[data-crm-outreach-start],[data-crm-campaign],[data-crm-draft-approve],[data-crm-draft-skip],[data-crm-company-toggle],[data-crm-skip-company],[data-crm-outreach-refresh],[data-crm-outreach-back],[data-outreach-open-crm-companies],[data-outreach-save-companies],[data-msg-read-more],#chat-send,#chat-clear,#memory-search,#toggle-pause,#agents-vault-search,#delegate-selected-btn,#btn-logout,#btn-infra-refresh");if(!a)return;let p=()=>{if(a.dataset.msgReadMore){e.state._msgExpand||(e.state._msgExpand={});let u=a.dataset.msgReadMore;e.state._msgExpand[u]=(e.state._msgExpand[u]||0)+1,e.initMsgReadMore(a.closest(".msg-read-more-host")||k);return}if(a.id==="chat-send")return e.sendChat();if(a.id==="chat-clear")return e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.setChatSessionId(null),e.render();if(a.id==="memory-search")return e.searchMemory();if(a.id==="toggle-pause")return e.togglePause();if(a.id==="agents-vault-search")return e.agentsVaultSearch();if(a.id==="delegate-selected-btn")return e.delegateAgent();if(a.id==="btn-logout")return e.logoutPin();if(a.id==="btn-infra-refresh")return e.refreshInfraHealth();if(a.dataset.operator)return e.openOperatorAction(a.dataset.operator);if(a.dataset.toggleUi)return e.state.ui||(e.state.ui={}),e.state.ui[a.dataset.toggleUi]=!e.state.ui[a.dataset.toggleUi],e.render();if(a.dataset.goto)return e.goView(a.dataset.goto);if(a.dataset.approve)return e.decideApproval(a.dataset.approve,!0);if(a.dataset.reject)return e.decideApproval(a.dataset.reject,!1);if(a.dataset.selectSpecialist!==void 0)return e.selectSpecialist(a.dataset.selectSpecialist||"");if(a.dataset.agentsTab){e.state.agentsTab=a.dataset.agentsTab,localStorage.setItem("fos_agents_tab",e.state.agentsTab),e.render(),e.state.agentsTab==="vault"?e.onWorldContextChanged({vaultWorldId:e.currentWorldId(),forceVault:!1}).then(()=>e.patchAgentsVaultPanel()):e.drawGraphs();return}if(a.dataset.toggleRun){let u=a.dataset.toggleRun;return e.state.expandedRunId=e.state.expandedRunId===u?null:u,e.render()}if(a.dataset.memoryTab)return e.memoryGraphTab=a.dataset.memoryTab,e.render({graphs:!1});if(a.dataset.inspectWorld)return e.selectInspectorWorld(a.dataset.inspectWorld);if(a.dataset.worldGraphTab)return e.switchWorldGraphTab(a.dataset.worldGraphTab);if(a.dataset.useWorld)return e.setActiveWorld(a.dataset.useWorld),e.goView("chat");if(a.dataset.setActiveWorld)return e.setActiveWorld(a.dataset.setActiveWorld),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.onWorldContextChanged({vaultWorldId:a.dataset.setActiveWorld,forceVault:!0}).then(()=>e.currentView==="world"?e.patchWorldPanels():e.render({graphs:!1}));if(a.dataset.editWorld)return e.state.worldEditing=a.dataset.editWorld,e.render();if(a.dataset.cancelEdit!==void 0)return e.state.worldEditing=null,e.render();if(a.dataset.deleteWorld)return e.deleteWorld(a.dataset.deleteWorld);if(a.dataset.vaultIngest)return e.vaultIngest(a.dataset.vaultIngest);if(a.dataset.vaultLink)return e.vaultLinkRepo(a.dataset.vaultLink);if(a.dataset.vaultSearch)return e.vaultSearch(a.dataset.vaultSearch);if(a.dataset.vaultReload)return e.reloadVaultFromServer(a.dataset.vaultReload);if(a.dataset.vaultFacet)return e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=a.dataset.vaultFacet,e.patchWorldPanels();if(a.dataset.vaultAddDoc!==void 0)return e.state.ui||(e.state.ui={}),e.state.ui.vaultDocForm=!0,e.state.ui.vaultDocEdit=null,e.patchWorldPanels();if(a.dataset.vaultCancelDoc!==void 0)return e.state.ui&&(e.state.ui.vaultDocForm=!1,e.state.ui.vaultDocEdit=null),e.patchWorldPanels();if(a.dataset.vaultEditDoc)return e.startVaultDocEdit(e.inspectorWorldId(),a.dataset.vaultEditDoc);if(a.dataset.vaultViewDoc){let u=a.dataset.worldId||e.inspectorWorldId(),m=a.dataset.vaultViewDoc;return m?e.openVaultDocViewer(u,m,a.dataset.docTitle||"Document"):void 0}if(a.dataset.tagVaultDoc)return e.tagVaultDocInChat(a.dataset.tagVaultDoc,a.dataset.worldId,a.dataset.docTitle,a.dataset.docPath);if(a.dataset.nudgeIndex!==void 0)return e.handleNudgeAction(a.dataset.nudgeIndex);if(a.dataset.removeAttachment!==void 0){let u=Number(a.dataset.removeAttachment);return Number.isNaN(u)||e.state._chatAttachments?.splice(u,1),e.render()}if(a.dataset.openVaultPicker!==void 0)return e.openVaultAttachPicker().catch(u=>alert(u.message));if(a.dataset.pickVaultDoc){e.tagVaultDocInChat(a.dataset.pickVaultDoc,a.dataset.worldId,a.dataset.docTitle,a.dataset.docPath),e.$("#vault-picker-dialog")?.close();return}if(a.dataset.crmTab)return e.state.ui||(e.state.ui={}),e.state.ui.crmTab=a.dataset.crmTab,localStorage.setItem("fos_crm_tab",e.state.ui.crmTab),e.loadCrmData().then(()=>e.render());if(a.dataset.crmOutreachRefresh!==void 0){let u=e.state.ui?.crmCampaignId;return u?e.pollCrmOutreachJob(u,!0):e.loadOutreachData().then(()=>e.render())}if(a.hasAttribute("data-outreach-save-companies"))return e.saveOutreachCompanySelection();if(a.hasAttribute("data-outreach-open-crm-companies"))return e.state.ui||(e.state.ui={}),e.state.ui.crmTab="companies",localStorage.setItem("fos_crm_tab","companies"),e.goView("crm");if(a.dataset.crmCompanyDetail)return e.openCrmCompanyDetail(a.dataset.crmCompanyDetail);if(a.dataset.crmCompanyClose!==void 0)return e.state.ui&&(e.state.ui.crmCompanyDetail=null),e.state._crmCompanyDetail=null,e.render();if(a.dataset.crmImportCompanies!==void 0)return e.importCrmCompaniesFromContacts();if(a.dataset.crmReload!==void 0)return e.loadCrmData().then(()=>e.render());if(a.dataset.crmFollowup)return e.scheduleCrmFollowup(a.dataset.crmFollowup,a.dataset.followupDays);if(a.dataset.crmWaThread)return e.loadCrmWaThread(a.dataset.crmWaThread);if(a.dataset.crmCampaign)return e.openCrmCampaignReview(a.dataset.crmCampaign);if(a.hasAttribute("data-crm-outreach-back"))return e.closeCrmCampaignReview();if(a.dataset.crmDraftApprove)return e.approveCrmDraft(a.dataset.crmDraftApprove);if(a.dataset.crmDraftSkip)return e.skipCrmDraft(a.dataset.crmDraftSkip);if(a.dataset.crmSkipCompany)return e.skipCrmCompany(a.dataset.crmSkipCompany);if(a.dataset.reminderDone)return e.updateReminderStatus(a.dataset.reminderDone,"done");if(a.dataset.reminderCancel)return e.updateReminderStatus(a.dataset.reminderCancel,"cancelled");if(a.dataset.notifAction)return e.openNotificationAction(a.dataset.notifAction,a.dataset.notifId);if(a.dataset.vaultDeleteDoc)return e.deleteVaultDoc(e.inspectorWorldId(),a.dataset.vaultDeleteDoc);if(a.dataset.githubAdd)return e.connectGithubRepo(a.dataset.githubAdd);if(a.dataset.githubSync)return e.syncGithubRepo(a.dataset.worldId,a.dataset.githubSync);if(a.dataset.githubUnlink)return e.unlinkGithubRepo(a.dataset.worldId,a.dataset.githubUnlink);if(a.dataset.goalDone)return e.markGoalDone(a.dataset.goalDone);if(a.dataset.historyTab)return e.historyTab=a.dataset.historyTab,localStorage.setItem("fos_history_tab",e.historyTab),e.render();if(a.dataset.historySession)return e.loadHistorySession(a.dataset.historySession);if(a.dataset.openChatSession)return e.setChatSessionId(a.dataset.openChatSession),e.loadChatFromServer().then(()=>e.goView("chat"));if(a.hasAttribute("data-new-chat-session"))return e.setChatSessionId(null),e.chatHistory=[],localStorage.setItem("fos_chat","[]"),e.loadChatSessionsList().then(()=>{e.currentView==="chat"?e.render():e.goView("chat")});if(a.dataset.chatSession)return e.setChatSessionId(a.dataset.chatSession),e.loadChatFromServer().then(()=>e.render());if(a.dataset.cancelJob)return e.cancelActiveJob(a.dataset.cancelJob);if(a.dataset.cancelActiveJob!==void 0)return e.cancelActiveJob();if(a.dataset.openDocument)return e.openDocumentsWorkspace(Number(a.dataset.openDocument));if(a.dataset.mdArtifact)return e.openDocumentsWorkspace(Number(a.dataset.mdArtifact));if(a.dataset.selectDocument)return e.selectDocument(a.dataset.selectDocument);if(a.dataset.docsAction){let u=a.dataset.docsAction;if(u==="new")return e.createNewDocument().catch(m=>alert(m.message));if(u==="toggle")return e.documentsEditMode&&(e.state._documentDraft=document.getElementById("docs-source")?.value??e.state._documentDraft),e.documentsEditMode=!e.documentsEditMode,e.render();if(u==="save")return e.saveCurrentDocument().catch(m=>alert(m.message));if(u==="memory")return e.saveDocumentToMemory().catch(m=>alert(m.message))}};return e.shouldSkipActionBusy(a)?p():e.runWithActionBusy(p,a)}),k.addEventListener("submit",b=>{let a=b.target;if(!(a instanceof HTMLFormElement))return;let p={"world-create-form":e.createWorldFromForm,"crm-create-form":e.submitCrmContact,"crm-company-form":e.submitCrmCompany,"crm-outreach-form":e.submitCrmOutreach,"goal-create-form":e.submitGoal,"reminder-create-form":e.submitReminder,"agent-config-form":e.saveAgentConfig,"world-edit-form":e.saveWorldEdit,"vault-doc-form":e.submitVaultDoc};if(p[a.id]){b.preventDefault();let u=a.querySelector('[type="submit"]');e.runWithActionBusy(()=>p[a.id](a),u)}}),k.addEventListener("change",b=>{if(b.target.id==="chat-file")return e.uploadFile(b);if(b.target.id==="docs-upload"){let a=b.target.files?.[0];a&&e.uploadDocumentFile(a).catch(p=>alert(p.message)),b.target.value="";return}if(b.target.id==="specialist-select-agents"||b.target.id==="chat-specialist-select")return e.selectSpecialist(b.target.value);if(b.target.id==="rag-mode-select"){e.state.ragMode=b.target.value||"auto",localStorage.setItem("fos_rag_mode",e.state.ragMode);return}b.target.matches("[data-crm-status]")&&e.updateCrmStatus(b.target.dataset.crmStatus,b.target.value),b.target.matches("[data-crm-whatsapp]")&&e.updateCrmWhatsapp(b.target.dataset.crmWhatsapp,b.target.checked),b.target.matches("[data-crm-company-toggle]")&&e.toggleOutreachDraftCompany(b.target),b.target.id==="crm-outreach-batch"&&e.setOutreachBatchSize(b.target.value),b.target.id==="crm-outreach-world"&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachWorld=b.target.value,e.restoreOutreachSelectionForWorld(b.target.value),e.loadOutreachData().then(()=>e.render()))}),k.addEventListener("blur",b=>{if(b.target.matches(".crm-draft-subject, .crm-draft-body")){let a=b.target.dataset.draftId;a&&e.saveCrmDraftEdits(a).catch(()=>{})}},!0),k.addEventListener("keydown",b=>{b.target.id==="chat-input"&&b.key==="Enter"&&!b.shiftKey&&(b.preventDefault(),e.sendChat()),b.target.id==="memory-q"&&b.key==="Enter"&&e.searchMemory()}),k.addEventListener("input",b=>{if(b.target.id==="outreach-company-search"&&e.filterOutreachCompanyList(b.target.value),b.target.matches(".crm-draft-body--fit, .outreach-auto-textarea")&&e.fitOutreachTextarea?.(b.target),b.target.matches(".crm-draft-body[data-channel='whatsapp']")){let a=b.target.dataset.draftId,p=document.querySelector(`.crm-wa-count[data-draft-id="${a}"]`);p&&(p.textContent=`${b.target.value.length}/300`)}b.target.id==="delegate-selected"&&(e.state._delegateDraft=b.target.value)}))}e.initContentDelegation=S}function Ve(e){function S(a="rag-mode-select"){let p=e.RAG_MODES.map(u=>`<option value="${e.esc(u.id)}" title="${e.esc(u.hint)}">${e.esc(u.label)}</option>`).join("");return`<label class="chat-control">
      <span class="caption-uppercase">Retrieval</span>
      <select id="${e.esc(a)}" class="world-select agent-select" aria-label="RAG mode">${p}</select>
    </label>`}function k(){requestAnimationFrame(()=>{let a=e.$("#chat-messages")?.querySelectorAll(".msg:not(.system)"),p=a?.[a.length-1];FOSMotion?.animateNewMessage?.(p)})}function b(a={}){let p=e.$("#content");if(!p)return;let u={dashboard:e.renderDashboard,chat:e.renderChat,agents:e.renderAgents,world:e.renderWorld,approvals:e.renderApprovals,crm:e.renderCrm,outreach:e.renderOutreach,goals:e.renderGoals,memory:e.renderMemory,history:e.renderHistory,documents:e.renderDocuments,tools:e.renderTools,activity:e.renderActivity,settings:e.renderSettings};try{if(e.state._viewLoading)p.innerHTML=e.renderViewSkeleton(e.currentView);else{let o=u[e.currentView]||e.renderDashboard;p.innerHTML=o()}}catch(o){console.error("render failed:",o),p.innerHTML=`<div class="driver-card span-12">
        <p class="title-md">Dashboard could not render</p>
        <p class="body-md muted" style="margin-top:8px">${e.esc(o?.message||String(o))}</p>
        <button type="button" class="button-primary button-sm" id="render-retry" style="margin-top:12px">Retry</button>
      </div>`,e.$("#render-retry")?.addEventListener("click",()=>e.boot());return}document.querySelector(".content")?.classList.toggle("content--worlds",e.currentView==="world"),document.querySelector(".content")?.classList.toggle("content--wide",["agents","world","activity","chat","history","documents"].includes(e.currentView)),document.querySelector(".content")?.classList.toggle("content--chat",e.currentView==="chat"),e.populateSpecialistSelect();let m=e.$("#rag-mode-select");if(m&&(m.value=e.state.ragMode||"auto"),a.post!==!1&&(e.afterRender({graphs:a.graphs!==!1}),e.state._scrollWorldCreate&&e.currentView==="world"&&(e.state._scrollWorldCreate=!1,requestAnimationFrame(()=>document.getElementById("world-create-panel")?.scrollIntoView({behavior:"smooth",block:"nearest"})))),e.currentView==="chat"){let o=e.$("#chat-messages");o&&(o.scrollTop=o.scrollHeight)}}e.renderRagModeSelect=S,e.animateLatestChatMessage=k,e.render=b}function Fe(e){function S(t){console.error(`${e.APP_NAME} boot failed:`,t),e.setConnectionStatus("Offline","paused");let s=e.esc(t?.message||String(t));e.$("#content").innerHTML=`<div class="driver-card span-12">
      <p class="title-md">Could not connect to ${e.esc(e.APP_NAME)}</p>
      <p class="body-md muted" style="margin-top:8px">${s}</p>
      <p class="body-md muted" style="margin-top:12px">Make sure <code>python main.py</code> is running, then tap <strong>Refresh</strong> in the top bar.</p>
    </div>`}function k(t,s){let l=e.$("#pin-gate"),i=document.querySelector(".app"),f=e.$("#pin-error"),D=e.$("#pin-input");l&&(l.hidden=!1,l.classList.add("is-visible")),i&&i.setAttribute("inert",""),f&&(t?(f.textContent=t,f.hidden=!1):(f.hidden=!0,f.textContent="")),D&&!s&&(D.disabled=!1,D.focus()),D&&s&&(D.disabled=!0,f&&(f.textContent=`Too many attempts. Wait ${s}s.`,f.hidden=!1)),e.setConnectionStatus("Locked","paused")}function b(){let t=e.$("#pin-gate"),s=document.querySelector(".app");t&&(t.hidden=!0,t.classList.remove("is-visible")),s&&s.removeAttribute("inert")}async function a(){return(await fetch("/api/auth/status",{credentials:"same-origin",headers:{Accept:"application/json"}})).json()}function p(){window.__FOS_PIN_BOUND||(window.__FOS_PIN_BOUND=!0,e.$("#pin-form")?.addEventListener("submit",async t=>{t.preventDefault();let s=(e.$("#pin-input")?.value||"").trim(),l=e.$("#pin-error");if(!/^\d{6}$/.test(s)){l&&(l.textContent="Enter exactly 6 digits",l.hidden=!1);return}try{let i=await fetch("/api/auth/pin",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:s})}),f=await i.json().catch(()=>({}));if(!i.ok)throw new Error(f.error||"Incorrect PIN");e.hidePinGate(),e.$("#pin-input").value="",l&&(l.hidden=!0),await e.startApp()}catch(i){l&&(l.textContent=i.message,l.hidden=!1);let f=await e.fetchAuthStatus().catch(()=>({}));f.locked_seconds&&e.showPinGate(i.message,f.locked_seconds)}}),e.$("#pin-input")?.addEventListener("input",t=>{t.target.value=t.target.value.replace(/\D/g,"").slice(0,6)}))}function u(){e.resolveBootRoute();let t=new URLSearchParams(location.search),s=t.get("world");s&&(e.state.inspectorWorldId=s,e.setActiveWorld(s));let l=t.get("companies");if(l&&e.currentView==="outreach"){let i=l.split(",").map(f=>parseInt(f.trim(),10)).filter(Boolean);i.length&&(e.state.ui||(e.state.ui={}),e.state.ui.crmOutreachSelected=i),t.delete("companies")}if(t.get("github")==="connected"||t.get("github_error")){let i=t.get("github_error");i&&console.warn("GitHub auth:",i),t.delete("github"),t.delete("github_error");let f=location.pathname||"/",D=t.toString();history.replaceState({},"",f+(D?`?${D}`:""))}}async function m(){e.applyBootUrlParams(),e.$$(".nav button").forEach(s=>s.classList.toggle("is-active",s.dataset.view===e.currentView)),e.$("#view-title").textContent=e.TITLES[e.currentView]||e.currentView,e.syncMobileNav(e.currentView);try{await e.refresh(!0)}catch(s){e.showBootError(s);return}let t=++e.viewDataLoadGen;e.setViewLoading(!0),e.render({post:!1});try{if(await e.loadViewData(e.currentView),t!==e.viewDataLoadGen)return;e.setViewLoading(!1),e.render()}catch(s){console.error(s),t===e.viewDataLoadGen&&e.setViewLoading(!1)}e.startLivePoll(),typeof decorateNavIcons=="function"&&decorateNavIcons()}async function o(){e.initContentDelegation(),e.initMdEditorDialog(),e.bindPinGate();let t=window.__FOS_AUTH;if(!t)try{t=await e.fetchAuthStatus()}catch(s){e.showBootError(s);return}if(t.pin_required&&!t.authenticated){e.showPinGate(null,t.locked_seconds||0);return}e.hidePinGate(),await e.startApp()}e.showBootError=S,e.showPinGate=k,e.hidePinGate=b,e.fetchAuthStatus=a,e.bindPinGate=p,e.applyBootUrlParams=u,e.startApp=m,e.boot=o}var re={dashboard:"/",chat:"/ask",agents:"/agents",world:"/worlds",crm:"/crm",outreach:"/outreach",goals:"/goals",memory:"/memory",documents:"/documents",history:"/history",approvals:"/approvals",tools:"/tools",activity:"/activity",settings:"/settings"},Ge=new Set(Object.keys(re)),Ne={"/chat":"chat","/control":"dashboard","/dashboard":"dashboard"},je=Object.fromEntries(Object.entries(re).map(([e,S])=>[e,S]));function pt(e){return!e||e==="/"?"/":e.replace(/\/+$/,"")||"/"}function oe(e){let S=pt(e),k=S.match(/^\/outreach\/campaigns\/(\d+)(?:\/review)?$/);if(k)return{view:"outreach",params:{campaignId:parseInt(k[1],10)}};if(S==="/outreach")return{view:"outreach",params:{}};if(Ne[S]){let b=Ne[S];return{view:b,params:{},redirect:je[b]}}for(let[b,a]of Object.entries(re))if(a===S)return{view:b,params:{}};return{view:"dashboard",params:{},redirect:"/"}}function ne(e,S={}){return e==="outreach"&&S.campaignId?`/outreach/campaigns/${S.campaignId}`:je[e]||"/"}function Be(e){let S=!1;function k(o,t={}){e.routeParams={...t},o==="outreach"&&(e.state.ui||(e.state.ui={}),t.campaignId?e.state.ui.crmCampaignId=t.campaignId:(t.campaignId===null||t.campaignId===void 0)&&(t.keepCampaign||(e.state.ui.crmCampaignId=null)),t.companies?.length&&(e.state.ui.crmOutreachSelected=t.companies.map(Number).filter(Boolean)))}function b(o,t={},{replace:s=!1}={}){Ge.has(o)||(o="dashboard");let l=ne(o,t),i=window.location.search||"",f=l+i,D=window.location.pathname+i;if(f!==D){let I={view:o,params:t};s?window.history.replaceState(I,"",f):window.history.pushState(I,"",f)}k(o,t)}function a({replace:o=!1}={}){let t=oe(window.location.pathname);if(t.redirect){let s=window.location.search||"";window.history.replaceState({view:t.view,params:t.params},"",t.redirect+s)}return k(t.view,t.params),e.currentView=t.view,t}function p(){return localStorage.getItem("fos_crm_tab")==="outreach"?(localStorage.removeItem("fos_crm_tab"),{view:"outreach",params:{}}):null}function u(){let o=new URLSearchParams(window.location.search),t=o.get("view");if(t&&Ge.has(t)){o.delete("view");let l=ne(t,{}),i=o.toString(),f=l+(i?`?${i}`:"");return window.history.replaceState({view:t,params:{}},"",f),k(t,{}),e.currentView=t,{view:t,params:{}}}let s=p();if(s&&window.location.pathname==="/"){let l=window.location.search||"";return window.history.replaceState(s,"",ne(s.view,s.params)+l),k(s.view,s.params),e.currentView=s.view,s}return a({replace:!0})}function m(){window.addEventListener("popstate",()=>{if(S)return;let o=oe(window.location.pathname);k(o.view,o.params),e.goView(o.view,{skipUrl:!0,params:o.params,fromPopstate:!0})})}e.routeParams={},e.pathToRoute=oe,e.routeToPath=ne,e.updateRoute=b,e.syncRouteFromLocation=a,e.resolveBootRoute=u,e.applyRouteParams=k,e.initRouter=m,e._routerSuppressPopstate=o=>{S=o}}function He(e){e.$$(".nav button").forEach(m=>m.addEventListener("click",()=>e.goView(m.dataset.view))),e.$("#btn-sidebar-open")?.addEventListener("click",e.openSidebar);let S=document.querySelector(".app"),k=e.$("#btn-sidebar-collapse"),b="fos_sidebar_collapsed";localStorage.getItem(b)==="1"&&S?.classList.add("sidebar-collapsed");let a=()=>{let m=S?.classList.contains("sidebar-collapsed");k?.setAttribute("aria-label",m?"Expand sidebar":"Collapse sidebar"),k?.setAttribute("title",m?"Expand sidebar":"Collapse sidebar")};a(),k?.addEventListener("click",()=>{S?.classList.toggle("sidebar-collapsed"),localStorage.setItem(b,S?.classList.contains("sidebar-collapsed")?"1":"0"),a()}),e.$("#vault-picker-close")?.addEventListener("click",()=>e.$("#vault-picker-dialog")?.close()),e.$("#vault-picker-dialog")?.addEventListener("click",m=>{m.target.id==="vault-picker-dialog"&&e.$("#vault-picker-dialog").close()}),e.$("#sidebar-close")?.addEventListener("click",e.closeMobileShell),e.$("#sidebar-backdrop")?.addEventListener("click",e.closeMobileShell),document.querySelectorAll(".mobile-tab").forEach(m=>{m.addEventListener("click",()=>{let o=m.dataset.mobileView;o==="more"?(e.syncMobileNav(e.currentView),document.getElementById("mobile-menu-drawer")?.showModal()):e.goView(o)})}),document.querySelectorAll(".mobile-menu-link").forEach(m=>{m.addEventListener("click",()=>e.goView(m.dataset.view))});let p=e.$("#mobile-menu-drawer");e.$("#mobile-menu-close")?.addEventListener("click",()=>p?.close()),p?.addEventListener("click",m=>{m.target===p&&p.close()}),e.$("#btn-refresh")?.addEventListener("click",async()=>{await e.refresh();let m=++e.viewDataLoadGen;e.setViewLoading(!0);try{await e.loadViewData(e.currentView),m===e.viewDataLoadGen&&e.render()}finally{m===e.viewDataLoadGen&&e.setViewLoading(!1)}}),window.addEventListener("resize",()=>{window.innerWidth>900&&e.closeMobileShell()});let u=e.$("#notif-drawer");e.$("#btn-notifications")?.addEventListener("click",()=>{e.renderNotifications(),u?.showModal()}),u?.addEventListener("click",m=>{m.target===u&&u.close()}),e.$("#notif-read-all")?.addEventListener("click",async()=>{await e.api("/notifications/read-all",{method:"POST"}),await e.refresh(),e.renderNotifications(),e.updateBadges()}),e.$("#world-select")?.addEventListener("change",async m=>{let o=m.target,t=o.value||"root";o.disabled=!0;try{e.setActiveWorld(t),e.clearVaultScopedState(),e.invalidateGraphCache("graph-world"),e.currentView==="world"&&(e.state.inspectorWorldId=t,e.state.ui||(e.state.ui={}),e.state.ui.vaultFacet=null,e.patchWorldPanels()),await e.onWorldContextChanged({vaultWorldId:t,forceVault:!0}),e.currentView==="world"?e.patchWorldPanels():e.currentView==="agents"&&e.state.agentsTab==="vault"?e.patchAgentsVaultPanel():e.render({graphs:!1}),e.updateWorldContextChrome()}catch(s){console.error("world switch failed:",s)}finally{o.disabled=!1}}),window.addEventListener("error",m=>{console.error("UI error:",m.error||m.message),e.state?.config?.my_name||e.setConnectionStatus("UI error \u2014 hard refresh","paused")}),document.addEventListener("visibilitychange",()=>{document.hidden?(e.refreshTimer&&(clearTimeout(e.refreshTimer),e.refreshTimer=null),e.stopLivePoll()):(e.scheduleBackgroundRefresh(),!e.livePollTimer&&e.state?.config&&e.startLivePoll())})}var U={};function mt(){ie(U),le(U),de(U),ce(U),pe(U),ue(U),me(U),he(U),fe(U),ge(U),be(U),ve(U),ye(U),we(U),_e(U),$e(U),Se(U),ke(U),Ce(U),Ie(U),Ae(U),Oe(U),Le(U),Re(U),De(U),Te(U),Pe(U),Ee(U),We(U),Me(U),Ve(U),Fe(U),Be(U)}mt();U.initRouter();He(U);window.__FOS=U;Object.defineProperty(window,"currentView",{get:()=>U.currentView,set:e=>{U.currentView=e}});window.drawGraphs=(...e)=>U.drawGraphs(...e);window.drawDashboardCharts=(...e)=>U.drawDashboardCharts(...e);window.render=(...e)=>U.render(...e);U.boot();U.scheduleBackgroundRefresh();
