/* Arlene's Beans TEST — safe Sheets sync (not for Production).
 * Retrieves four complete Google Visualization JSONP tables before applying
 * any of them to the visible menu. Polls only the change signal every 60s.
 * Keeps the previous rendered menu when a refresh fails.
 */
(function(){
  "use strict";
  const POLL_MS = 60000;
  const TIMEOUT_MS = 12000;
  window.ArlenesSafeSync = function(options){
    const status = options.statusEl;
    const spreadsheetId = options.spreadsheetId;
    const names = options.sheets;
    const callbacks = options.callbacks;
    let pendingLoad = null;
    let polling = false;
    let committed = false;
    let appliedSignal = null;
    const snapshotKey = "arlenes-test-lastgood-v1:"+spreadsheetId+":"+options.screen;

    function validBundle(results){
      if(!Array.isArray(results) || results.length!==4)throw new Error("Incomplete menu bundle");
      for(const response of results){
        if(!response || !response.table || !Array.isArray(response.table.cols) ||
           !Array.isArray(response.table.rows))throw new Error("Invalid menu bundle");
      }
      validMenu(results[0]);
    }
    function applyBundle(results, fromStorage){
      validBundle(results);
      // These callbacks execute synchronously: the browser paints only after
      // all four have returned, avoiding intermediate incomplete frames.
      callbacks.menu(results[0]);
      callbacks.tacos(results[1]);
      callbacks.functions(results[2]);
      callbacks.images(results[3]);
      committed=true;
      if(fromStorage)status.textContent="Saved menu · checking for updates";
      if(!fromStorage){
        try{localStorage.setItem(snapshotKey,JSON.stringify(results));}
        catch(error){console.warn("Could not persist validated menu snapshot:",error);}
        if(!navigator.onLine)status.textContent="Offline · saved menu";
      }
    }
    function restoreSnapshot(){
      try{
        const raw=localStorage.getItem(snapshotKey);
        if(raw)applyBundle(JSON.parse(raw),true);
      }catch(error){console.warn("Saved menu snapshot unavailable:",error);}
    }

    function requestTable(sheet, callbackName, headers, range){
      return new Promise((resolve,reject)=>{
        const script=document.createElement("script");
        let finished=false;
        const timer=setTimeout(()=>finish(new Error("Timeout loading "+sheet)),TIMEOUT_MS);
        function finish(error, response){
          if(finished)return;
          finished=true;
          clearTimeout(timer);
          script.onerror=null;
          script.remove();
          delete window[callbackName];
          if(error)reject(error);else resolve(response);
        }
        window[callbackName]=response=>{
          if(!response || response.status==="error" ||
             !response.table || !Array.isArray(response.table.cols) ||
             !Array.isArray(response.table.rows)){
            finish(new Error("Invalid response from "+sheet));
          }else{
            finish(null,response);
          }
        };
        const base="https://docs.google.com/spreadsheets/d/"+encodeURIComponent(spreadsheetId)+"/gviz/tq";
        const params = [
          "sheet="+encodeURIComponent(sheet),
          "tqx=responseHandler:"+callbackName,
          range?"range="+encodeURIComponent(range):"tq="+encodeURIComponent("select *"),
          "headers="+headers,
          "_="+Date.now()
        ];
        script.src=base+"?"+params.join("&");
        script.async=true;
        script.onerror=()=>finish(new Error("Network error loading "+sheet));
        document.body.appendChild(script);
      });
    }
    function validMenu(response){
      const rows=options.rowsFrom(response.table);
      const cols=Object.keys(rows[0]||{});
      const required=["Display_Name","Screen_Suggestion","Active","Display_Category"];
      if(!rows.length || required.some(c=>!cols.includes(c))){
        throw new Error("Menu_Master is empty or has missing columns");
      }
      if(!rows.some(row=>String(row.Screen_Suggestion||"").trim()===options.screen &&
          String(row.Display_Name||"").trim())){
        throw new Error("No menu items found for "+options.screen);
      }
    }
    async function load(){
      if(pendingLoad)return pendingLoad;
      pendingLoad=(async()=>{
        try{
          const settled=await Promise.allSettled([
            requestTable(names.menu,"arlenesStagedMenu",1),
            requestTable(names.tacos,"arlenesStagedTacos",0),
            requestTable(names.functions,"arlenesStagedFunctions",1),
            requestTable(names.images,"arlenesStagedImages",1)
          ]);
          const failed=settled.find(result=>result.status==="rejected");
          if(failed)throw failed.reason;
          const results=settled.map(result=>result.value);
          applyBundle(results,false);
          return true;
        }catch(error){
          console.warn("Menu refresh deferred; existing display retained:",error);
          status.textContent=committed?"Update pending · last valid menu":"Waiting for a valid saved menu";
          return false;
        }finally{
          pendingLoad=null;
        }
      })();
      return pendingLoad;
    }
    async function checkSignal(){
      if(polling)return;
      polling=true;
      try{
        const response=await requestTable(names.signal,"arlenesStagedSignal",0,names.signalRange);
        const cell=response.table.rows[0]?.c?.[0];
        const signal=cell && cell.v!=null?String(cell.v):"";
        if(appliedSignal===null)appliedSignal=signal;
        if(!committed || signal!==appliedSignal){
          if(await load())appliedSignal=signal;
        }
      }catch(error){
        console.warn("Change check unavailable; keeping last valid menu:",error);
        if(!committed)await load();
      }finally{
        polling=false;
      }
    }
    restoreSnapshot();
    load();
    checkSignal();
    setInterval(checkSignal,POLL_MS);
    window.addEventListener("online",()=>{
      load().then(ok=>{if(ok)checkSignal()});
    });
    document.addEventListener("visibilitychange",()=>{
      if(!document.hidden)checkSignal();
    });
  };
})();
