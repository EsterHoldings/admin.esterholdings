<template>
  <div />

  <Teleport to="body">
    <div v-if="mounted" class="fixed inset-0 z-[9999] pointer-events-none">
      <div class="relative h-full w-full">
        <VueDraggableResizable
            v-model:x="pos.left"
            v-model:y="pos.top"
            v-model:w="pos.width"
            v-model:h="pos.height"
            :parent="true"
            :draggable="true"
            :resizable="true"
            :handles="['tl','tm','tr','mr','br','bm','bl','ml']"
            drag-handle=".drag-handle"
            drag-cancel=".no-drag, textarea, button"
            :min-width="minW"
            :min-height="minH"
            :z="10000"
            class="vdr-wrapper chat-frame pointer-events-auto"
            @dragstop="onDragStop"
            @resizestop="onResizeStop"
        >
          <div class="support-chat flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[var(--ui-primary-main)] bg-[var(--color-stroke-ui-dark)] shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
            <div class="drag-handle relative flex select-none items-center justify-between border-b border-[#2a3f73] px-4 py-3">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-white/95">Support Chat</h3>
                <div class="flex items-center gap-2 text-sm text-white/80">
                  <span
                      class="inline-flex h-2.5 w-2.5 rounded-full"
                      :class="isCounterpartyOnline ? 'bg-emerald-500' : 'bg-gray-400'"
                  />
                  <span>{{ isCounterpartyOnline ? 'Online' : 'Offline' }}</span>
                </div>
              </div>
              <button @click="emit('close')" class="no-drag rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white/90" title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                  <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.4 1.41 6.29 6.29-6.3 6.3 1.41 1.4 6.3-6.29 6.29 6.3 1.41-1.41-6.3-6.3 6.3-6.29z"/>
                </svg>
              </button>
            </div>

            <div
                v-if="booting"
                class="absolute z-10 flex items-center justify-center backdrop-blur-sm p-4"
                style="left:1px; right:1px; top:61px; bottom:81px"
            >
              <UiIconSpinnerDefault class="!text-[var(--ui-text-main)]"/>
            </div>

            <div
                ref="listRef"
                class="messages no-scrollbar flex-1 overflow-y-auto px-4 py-5 space-y-6"
                :style="{ overflowAnchor: 'none', visibility: booting ? 'hidden' : 'visible' }"
                @scroll.passive="onScroll"
            >
              <template v-for="item in renderItems" :key="item.key">
                <div v-if="item.kind==='sep'" class="flex items-center gap-3 text-white/70 select-none">
                  <span class="h-px flex-1 bg-white/10"></span>
                  <span class="text-xs uppercase tracking-wider opacity-80">— {{ item.label }} —</span>
                  <span class="h-px flex-1 bg-white/10"></span>
                </div>

                <template v-else>
                  <div
                      v-if="!isMe(item.msg)"
                      class="flex items-end gap-3"
                      :data-mid="item.msg.id"
                  >
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2962ff] text-sm font-semibold text-white">S</div>
                    <div class="max-w-[80%] rounded-[10px] bg-[#2c61ff] p-2 text-[15px] leading-6 text-white ring-1 ring-[#5b8cff]">
                      <p class="whitespace-pre-wrap break-words">{{ item.msg.body }}</p>
                      <div class="mt-1 text-[12px] text-white/70">{{ formatDateTime(item.msg.createdAt) }}</div>
                    </div>
                  </div>

                  <div
                      v-else
                      class="flex items-end justify-end gap-3"
                      :data-mid="item.msg.id"
                  >
                    <div class="max-w-[82%] rounded-[10px] bg-[#2563ff] p-2 text-[15px] leading-6 text-white ring-1 ring-[#5b8cff]">
                      <p class="whitespace-pre-wrap break-words">{{ item.msg.body }}</p>
                      <div class="mt-1 text-right text-[12px] text-white/80">{{ formatDateTime(item.msg.createdAt) }}</div>
                    </div>
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff7a1a] text-sm font-semibold text-white">M</div>
                  </div>
                </template>
              </template>

              <div v-if="!messages.length && !booting" class="text-center text-white/60">No messages yet</div>
            </div>

            <div class="border-t border-[#2a3f73] p-3">
              <div class="flex items-center gap-2 rounded-2xl bg-[#0a2a74]/50 p-2 ring-1 ring-[#2a3f73]">
                <textarea
                    ref="inputRef"
                    v-model="draft"
                    rows="1"
                    @keydown.enter.prevent="send"
                    @keydown.shift.enter.stop
                    class="no-drag max-h-28 flex-1 resize-none bg-transparent py-2 text-[15px] text-white placeholder:text-white/60 outline-none"
                    placeholder="Write your message"
                />
                <button
                    :disabled="!canSend"
                    @click="send"
                    class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563ff] text-white ring-1 ring-[#5b8cff] hover:bg-[#2b6dff] disabled:cursor-not-allowed disabled:opacity-50"
                    title="Send"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                    <path d="m2.01 21 20-9L2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </VueDraggableResizable>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount, nextTick, reactive, watch} from 'vue'
import {useNuxtApp} from 'nuxt/app'
import useAppCore from '~/composables/useAppCore'
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/style.css'

type ChatMessage = { id: string; author: 'me' | 'support' | 'other'; body: string; createdAt: number }
type ApiMsg = { id: string; ticket_id: string; user_id: any; type: string; body: string | null; meta: any; created_at: string }
type RenderSep = { kind:'sep'; key:string; label:'today'|'yesterday' }
type RenderMsg = { kind:'msg'; key:string; msg:ChatMessage }
type RenderItem = RenderSep | RenderMsg
type PresenceUser = { id:number; name:string; role?:string }

const props = defineProps<{ ticketId: number; currentUser: { id: number; name: string; role?:string }, adminChat: false }>()
const emit = defineEmits(['close'])

const mounted = ref(false)
const minW = 320, minH = 420, margin = 16
const pos = reactive({ top: 0, left: 0, width: 380, height: 540 })
function clampToViewport() {
  const vw = window.innerWidth, vh = window.innerHeight
  pos.width  = Math.max(minW, Math.min(pos.width,  vw - 2*margin))
  pos.height = Math.max(minH, Math.min(pos.height, vh - 2*margin))
  pos.left   = Math.max(margin, Math.min(pos.left,  vw - pos.width  - margin))
  pos.top    = Math.max(margin, Math.min(pos.top,   vh - pos.height - margin))
}
function initPosition() {
  const isMobile = window.innerWidth < 768
  pos.width  = isMobile ? Math.max(minW, window.innerWidth - margin*2) : 380
  pos.height = isMobile ? Math.max(minH, Math.round(window.innerHeight*0.7)) : 540
  pos.left   = window.innerWidth  - pos.width  - margin
  pos.top    = window.innerHeight - pos.height - margin
  clampToViewport()
}
function onViewportResize(){ clampToViewport() }
function onDragStop(l:number,t:number){ pos.left=l; pos.top=t }
function onResizeStop(l:number,t:number,w:number,h:number){ pos.left=l; pos.top=t; pos.width=w; pos.height=h }

const listRef = ref<HTMLElement|null>(null)
const inputRef = ref<HTMLTextAreaElement|null>(null)
const booting = ref(true)

const PAGE_SIZE = 6
let nextPage = 2
const hasMore = ref(true)
const draft = ref('')
const messages = reactive<ChatMessage[]>([])

const userIsNearBottom = ref(true)
let suppressScrollEvents = false
let lastUserScrollAt = 0
const STICKY_EPS = 16
const SCROLL_IDLE_MS = 200

const isMe = (m:ChatMessage)=> m.author==='me'
const canSend = computed(()=> draft.value.trim().length>0)

function pad(n:number){ return n<10 ? `0${n}` : `${n}` }
function formatDateTime(ts:number){
  const d = new Date(ts)
  const YYYY = d.getFullYear(), MM = pad(d.getMonth()+1), DD = pad(d.getDate())
  const hh = pad(d.getHours()), mm = pad(d.getMinutes()), ss = pad(d.getSeconds())
  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`
}
function parseLocalMs(input: string | number | Date): number {
  if (typeof input === 'number') return input
  if (input instanceof Date) return input.getTime()
  const s = String(input).trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/)
  if (m) { const [,Y,Mo,D,h,mi,se] = m.map(Number) as unknown as number[]; return new Date(Y,Mo-1,D,h,mi,se,0).getTime() }
  const t = Date.parse(s); return Number.isNaN(t) ? Date.now() : t
}
const localDayKey = (ts: number) => {
  const d = new Date(ts)
  return d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate()
}
const todayLocalKey = computed(() => localDayKey(Date.now()))
const yesterdayLocalKey = computed(() => { const y = new Date(); y.setDate(y.getDate()-1); return localDayKey(+y) })

const renderItems = computed<RenderItem[]>(() => {
  const out: RenderItem[] = []
  const seen = new Set<number>()
  for (const m of messages) {
    const key = localDayKey(m.createdAt)
    if (!seen.has(key)) {
      if (key === todayLocalKey.value) out.push({ kind: 'sep', key: `sep-${key}-today`, label: 'today' })
      else if (key === yesterdayLocalKey.value) out.push({ kind: 'sep', key: `sep-${key}-yesterday`, label: 'yesterday' })
      seen.add(key)
    }
    out.push({ kind: 'msg', key: m.id, msg: m })
  }
  return out
})

function firstVisibleEl(el:HTMLElement):HTMLElement|null{
  const cr = el.getBoundingClientRect()
  for(const c of Array.from(el.querySelectorAll<HTMLElement>('[data-mid]'))){
    const r=c.getBoundingClientRect()
    if(r.bottom>cr.top && r.top<cr.bottom) return c
  }
  return null
}
async function keepScrollDuring(mut:()=>void|Promise<void>){
  const el = listRef.value!
  suppressScrollEvents = true
  const anchor = firstVisibleEl(el)
  const beforeTop = anchor? anchor.getBoundingClientRect().top : 0
  await Promise.resolve(mut())
  await nextTick()
  await new Promise(requestAnimationFrame)
  if(anchor){
    const afterTop = anchor.getBoundingClientRect().top
    el.scrollTop += (afterTop - beforeTop)
  }
  suppressScrollEvents = false
}
function scrollToBottom(){
  const el=listRef.value
  if(!el) return
  suppressScrollEvents = true
  el.scrollTop = el.scrollHeight
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ suppressScrollEvents=false }) })
}

const appCore = useAppCore()
function mapApi(m:ApiMsg):ChatMessage{
  return {
    id: m.id,
    author: m.user_id===props.currentUser.id ? 'me' : 'other',
    body: m.body ?? '',
    createdAt: parseLocalMs(m.created_at)
  }
}
function ensureAscOrder(){ messages.sort((a,b)=> a.createdAt - b.createdAt || (a.id > b.id ? 1 : -1)) }
async function fetchPageAsAsc(pageNum:number){
  const params={ page: pageNum, pageSize: PAGE_SIZE, sort:'desc' as const }
  const res = props.adminChat
      ? await appCore.adminModules.tickets.getTicketMessages(props.ticketId, params)
      : await appCore.tickets.getTicketMessages(props.ticketId, params)
  const arr:ApiMsg[] = Array.isArray(res?.data)? res.data : (res?.data?.data??[])
  return arr.map(mapApi).reverse()
}
async function loadInitial(){
  booting.value = true
  const asc = await fetchPageAsAsc(1)
  messages.splice(0,messages.length,...asc)
  ensureAscOrder()
  await nextTick(); await new Promise(requestAnimationFrame)
  scrollToBottom()
  userIsNearBottom.value = true
  booting.value = false
  hasMore.value = asc.length===PAGE_SIZE
  nextPage = 2
}
let loadingMore=false
async function loadMoreAbove(){
  if(loadingMore || !hasMore.value) return
  loadingMore = true
  const asc = await fetchPageAsAsc(nextPage)
  if(!asc.length){ hasMore.value=false; loadingMore=false; return }
  await keepScrollDuring(()=>{ messages.splice(0,0,...asc); ensureAscOrder() })
  hasMore.value = asc.length===PAGE_SIZE
  nextPage += 1
  loadingMore=false
}
function onScroll(){
  if(suppressScrollEvents) return
  const el=listRef.value; if(!el) return
  lastUserScrollAt = performance.now()
  userIsNearBottom.value = (el.scrollTop + el.clientHeight >= el.scrollHeight - STICKY_EPS)
  if(!loadingMore && hasMore.value && el.scrollTop <= 400) loadMoreAbove()
}

const {$echo}=useNuxtApp()

function subscribePrivate(){
  const ch = $echo.private(`chat.${props.ticketId}`)
  ch.listen('.MessageSent', async (e:any)=>{
    const el=listRef.value
    const shouldStick = !!el && userIsNearBottom.value && (performance.now() - lastUserScrollAt > SCROLL_IDLE_MS)
    messages.push(mapApi({
      id:e.id, ticket_id:e.ticket_id, user_id:e.user_id, type:e.type,
      body:e.body, meta:e.meta, created_at:e.created_at
    }))
    ensureAscOrder()
    await nextTick(); await new Promise(requestAnimationFrame)
    if(shouldStick) scrollToBottom()
  })
  return ch
}

let presenceChan:any = null
const onlineMap = reactive<Map<number, PresenceUser>>(new Map())

const isCounterpartyOnline = computed(() => {
  if (onlineMap.size === 0) return false
  for (const u of onlineMap.values()) {
    if (u.id !== props.currentUser.id) {
      return true
    }
  }
  return false
})

function applyPresencePayload(payload:any){
  onlineMap.clear()
  if (payload && Array.isArray(payload.online_admins)) {
    payload.online_admins.forEach((u:any) => {
      onlineMap.set(Number(u.id), { id: Number(u.id), name: String(u.name), role: 'admin' })
    })
  }
  if (payload && payload.online_client) {
    const u = payload.online_client
    onlineMap.set(Number(u.id), { id: Number(u.id), name: String(u.name), role: 'client' })
  }
}

function joinPresence(){
  presenceChan = $echo.private(`support.ticket.${props.ticketId}`)
      .listen('.ticket.presence.updated', (payload:any) => {
        applyPresencePayload(payload)
      })
}
function leavePresence(){
  try { $echo.leave(`support.ticket.${props.ticketId}`) } catch {}
  presenceChan = null
  onlineMap.clear()
}

let hb:any=null
async function apiOpen(ticketId:number){
  const data = await appCore.ticketsPresence.ping(ticketId)
  applyPresencePayload(data)
}
async function apiClose(ticketId:number){
  await appCore.ticketsPresence.presence(ticketId)
}
async function startPresenceHeartbeat(ticketId:number){
  await apiOpen(ticketId)
  stopPresenceHeartbeat()
  hb = setInterval(() => {
    apiOpen(ticketId).catch(()=>{})
  }, 15000)
}
function stopPresenceHeartbeat(){ if(hb){ clearInterval(hb); hb=null } }

let privateChan:any = null

onMounted( async ()=>{
  mounted.value = true
  initPosition()
  await loadInitial()
  window.addEventListener('resize', onViewportResize)

  await apiOpen(props.ticketId)
  joinPresence()
  privateChan = subscribePrivate()
  startPresenceHeartbeat(props.ticketId)
})

onBeforeUnmount(()=>{
  try{ if(privateChan) $echo.leave(`chat.${props.ticketId}`) }catch{}
  leavePresence()
  stopPresenceHeartbeat()
  apiClose(props.ticketId).catch(()=>{})
  window.removeEventListener('resize', onViewportResize)
})

watch(() => props.ticketId, async (id, oldId) => {
  if (id === oldId) return
  try{ if(privateChan) $echo.leave(`chat.${oldId}`) }catch{}
  leavePresence()
  await apiOpen(id)
  joinPresence()
  privateChan = subscribePrivate()
  stopPresenceHeartbeat()
  await startPresenceHeartbeat(id)
  booting.value = true
  messages.splice(0, messages.length)
  nextPage = 2; hasMore.value = true
  await loadInitial()
})

async function send(){
  if(!canSend.value) return
  const body=draft.value.trim(); draft.value=''
  const el = listRef.value
  const shouldStick = !!el && userIsNearBottom.value && (performance.now() - lastUserScrollAt > SCROLL_IDLE_MS)

  if(props.adminChat)
    await appCore.adminModules.tickets.storeTicketMessage(props.ticketId,{ user_id:props.currentUser.id, type:'text', body })
  else
    await appCore.tickets.storeTicketMessage(props.ticketId,{ user_id:props.currentUser.id, type:'text', body })

  await nextTick()
  if(shouldStick) scrollToBottom()
}
</script>

<style>
.chat-frame{ transition: box-shadow 120ms ease; border-radius: 16px; }
.chat-frame.dragging,.chat-frame.resizing{ box-shadow: 0 12px 48px rgba(0,0,0,.45); }

.vdr .handle{
  width:10px; height:10px; border-radius:4px;
  background:rgba(255,255,255,0.16);
  outline:1px solid rgba(255,255,255,0.28);
  box-shadow:0 0 0 1px rgba(0,0,0,0.2) inset;
  z-index:20; pointer-events:auto;
}
.vdr .handle:hover{ background:rgba(255,255,255,0.28); }
.vdr .handle.handle-tl{ transform:translate(-2px,-2px); cursor:nwse-resize; }
.vdr .handle.handle-tr{ transform:translate( 2px,-2px); cursor:nesw-resize; }
.vdr .handle.handle-bl{ transform:translate(-2px, 2px); cursor:nesw-resize; }
.vdr .handle.handle-br{ transform:translate( 2px, 2px); cursor:nwse-resize; }
.vdr .handle.handle-tm,.vdr .handle.handle-bm{ cursor:ns-resize; }
.vdr .handle.handle-ml,.vdr .handle.handle-mr{ cursor:ew-resize; }

.messages{
  overflow-anchor:none;
  overscroll-behavior: contain;
  scroll-behavior: auto;
}

.no-scrollbar::-webkit-scrollbar{ display:none }
.no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none }
</style>
