// 1) Créez un projet Supabase, puis collez ici l'URL et la clé Publishable.
const SUPABASE_URL = "COLLEZ_ICI_URL_SUPABASE";
const SUPABASE_ANON_KEY = "COLLEZ_ICI_CLE_PUBLISHABLE";
const configured = !SUPABASE_URL.startsWith("COLLEZ_") && !SUPABASE_ANON_KEY.startsWith("COLLEZ_");
const db = configured && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const authDialog = document.getElementById("authDialog");
const authMessage = document.getElementById("authMessage");
let currentUser = null;
let selectedCandidate = null;

function openLogin(){ authDialog.showModal(); }
document.getElementById("loginOpen").addEventListener("click", openLogin);
document.getElementById("commentLogin").addEventListener("click", openLogin);

if (!db) {
  document.getElementById("commentsList").innerHTML = '<p class="muted">La connexion et les commentaires seront activés après la configuration de Supabase.</p>';
  document.getElementById("pollOptions").innerHTML = '<p class="muted">Ajoutez les candidats dans la table « candidates » de Supabase pour afficher les choix du sondage.</p>';
}

document.getElementById("authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db) { authMessage.textContent = "Configuration nécessaire : ajoutez vos identifiants Supabase dans app.js."; return; }
  const email = document.getElementById("email").value.trim();
  const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  authMessage.textContent = error ? error.message : "Lien envoyé ! Vérifiez votre boîte e-mail.";
});

async function loadSession(){
  if(!db) return;
  const {data:{session}} = await db.auth.getSession();
  currentUser = session?.user || null;
  document.getElementById("loginOpen").textContent = currentUser ? "Connecté" : "Se connecter";
  document.getElementById("commentForm").classList.toggle("hidden", !currentUser);
  await loadComments();
}
async function loadCandidates(){
  if(!db) return;
  const {data,error} = await db.from("candidates").select("id,name,party,program,photo_url").eq("published",true).order("created_at",{ascending:false});
  if(error) return;
  const grid=document.getElementById("candidateGrid");
  grid.innerHTML="";
  data.forEach(c=>{
    const card=document.createElement("article"); card.className="candidate-card";
    const photo=document.createElement("div"); photo.className="candidate-placeholder";
    if(c.photo_url){photo.style.background=`linear-gradient(#0002,#0005),url("${c.photo_url}") center/cover`;photo.textContent="";}
    else photo.textContent="✿";
    const body=document.createElement("div");body.className="candidate-body";
    const tag=document.createElement("span");tag.className="tag";tag.textContent=c.party||"Indépendant";
    const title=document.createElement("h3");title.textContent=c.name;
    const desc=document.createElement("p");desc.textContent=c.program||"Programme à venir.";
    const actions=document.createElement("div");actions.className="candidate-actions";
    const yes=document.createElement("button");yes.className="btn btn-red";yes.textContent="♥ Soutenir";
    const no=document.createElement("button");no.className="btn btn-dark";no.textContent="✕ Pas convaincu";
    yes.addEventListener("click",()=>react(c.id,"support")); no.addEventListener("click",()=>react(c.id,"oppose"));
    actions.append(yes,no);body.append(tag,title,desc,actions);card.append(photo,body);grid.append(card);
  });
  const options=document.getElementById("pollOptions");options.innerHTML="";
  data.forEach(c=>{const label=document.createElement("label");label.className="poll-option";const radio=document.createElement("input");radio.type="radio";radio.name="poll";radio.value=c.id;radio.addEventListener("change",()=>{selectedCandidate=c.id;document.getElementById("pollSubmit").disabled=false;});label.append(radio,document.createTextNode(c.name));options.append(label);});
}
async function react(candidateId,kind){
  if(!currentUser){openLogin();return;}
  const {error}=await db.from("reactions").upsert({candidate_id:candidateId,user_id:currentUser.id,kind},{onConflict:"candidate_id,user_id"});
  if(error) alert(error.message); else alert("Votre réaction a été enregistrée.");
}
document.getElementById("pollSubmit").addEventListener("click",async()=>{
  if(!db||!selectedCandidate)return;
  if(!currentUser){openLogin();return;}
  const {error}=await db.from("poll_votes").upsert({candidate_id:selectedCandidate,user_id:currentUser.id},{onConflict:"user_id"});
  document.getElementById("pollMessage").textContent=error?error.message:"Votre choix a été enregistré. Merci de participer !";
});
document.getElementById("commentForm").addEventListener("submit",async(event)=>{
  event.preventDefault();if(!db||!currentUser)return;
  const content=document.getElementById("commentText").value.trim();if(!content)return;
  const {error}=await db.from("comments").insert({user_id:currentUser.id,content});
  if(error){alert(error.message);return;}
  document.getElementById("commentText").value="";await loadComments();
});
async function loadComments(){
  if(!db)return;
  const {data,error}=await db.from("comments").select("content,created_at").eq("approved",true).order("created_at",{ascending:false}).limit(30);
  if(error)return;
  const list=document.getElementById("commentsList");list.innerHTML="";
  if(!data.length){list.innerHTML='<p class="muted">Pas encore de commentaire. Lancez la discussion !</p>';return;}
  data.forEach(item=>{const el=document.createElement("div");el.className="comment";const who=document.createElement("strong");who.textContent="Citoyen";const p=document.createElement("p");p.textContent=item.content;el.append(who,p);list.append(el);});
}
if(db){db.auth.onAuthStateChange(()=>loadSession());loadSession();loadCandidates();}
