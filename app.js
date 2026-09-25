'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu'); }
menuButton.addEventListener('click', () => { const expanded = menuButton.getAttribute('aria-expanded') === 'true'; navigation.classList.toggle('is-open', !expanded); menuButton.setAttribute('aria-expanded', String(!expanded)); menuButton.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu'); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });
const form = document.querySelector('#evaluation-form');
const review = document.querySelector('#message-review');
const subject = document.querySelector('#subject');
const nameInput = document.querySelector('#client-name');
const messageInput = document.querySelector('#message');
const subjects = [...subject.options].map(option => option.value).filter(Boolean);
function editMessage() { review.hidden = true; form.hidden = false; }
function selectSubject(value) {
  if(!subjects.includes(value)) throw new Error('Assunto inválido.');
  editMessage(); subject.value = value;
}
function prepareMessage() {
  if(!form.reportValidity()) return null;
  const name = nameInput.value.trim();
  const details = messageInput.value.trim();
  const message = `Olá, Balbi!${name ? ` Meu nome é ${name}.` : ''}\nGostaria de conversar sobre: ${subject.value}.${details ? `\n\n${details}` : ''}\n\nComo podemos seguir com o atendimento?`;
  document.querySelector('#message-preview').textContent = message;
  document.querySelector('#whatsapp-link').href = `https://wa.me/5521967250075?text=${encodeURIComponent(message)}`;
  form.hidden = true; review.hidden = false;
  document.querySelector('#review-heading').focus({preventScroll:true});
  return {status:'message_prepared',subject:subject.value,externalMessageSent:false};
}
form.addEventListener('submit', event => {event.preventDefault();prepareMessage();});
document.querySelector('#edit-message').addEventListener('click', () => {editMessage();subject.focus({preventScroll:true});});
const privacyDialog = document.querySelector('#privacy-dialog');
document.querySelector('.privacy-button').addEventListener('click', () => privacyDialog.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => privacyDialog.close());
privacyDialog.addEventListener('click', event => {if(event.target === privacyDialog){const rect=privacyDialog.getBoundingClientRect();if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) privacyDialog.close();}});
document.querySelector('#year').textContent = new Date().getFullYear();
const modelContext = document.modelContext;
if (modelContext?.registerTool) {
  const lifecycle = new AbortController();
  window.addEventListener('pagehide', () => lifecycle.abort(), {once:true});
  try {
    Promise.resolve(modelContext.registerTool({
      name:'stage_evaluation_message', title:'Preparar assunto da avaliação',
      description:'Seleciona um assunto no formulário visível de avaliação. Não envia mensagens, não abre o WhatsApp e não confirma agendamento.',
      inputSchema:{type:'object',properties:{subject:{type:'string',enum:subjects}},required:['subject'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input){if(!input || typeof input !== 'object' || Object.keys(input).some(key=>key!=='subject') || !subjects.includes(input.subject))throw new Error('Selecione um assunto válido.');selectSubject(input.subject);document.querySelector('#avaliacao').scrollIntoView({behavior:'instant'});subject.focus({preventScroll:true});return {status:'subject_selected',subject:subject.value,externalMessageSent:false};}
    },{signal:lifecycle.signal})).catch(()=>{});
  }catch{/* The form remains fully available without WebMCP support. */}
}
