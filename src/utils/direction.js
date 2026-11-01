// Direction belongs to the interface. Media pixels, stored URLs and subtitle tracks
// keep their own direction. Never insert bidi control characters into user data.
const RTL = ['ar', 'ur', 'he']
let observer
export function isRTL(code){
    return RTL.indexOf(code || document.documentElement.lang) >= 0
}
export function apply(code){
    document.documentElement.lang = code
    document.documentElement.dir = isRTL(code) ? 'rtl' : 'ltr'
    if(!observer && document.body && typeof MutationObserver !== 'undefined'){
        observer = new MutationObserver(records=>{
            if(!isRTL()) return
            records.forEach(record=>{
                if(record.type === 'characterData') isolate(record.target.parentNode)
                else Array.from(record.addedNodes).forEach(node=>isolate(node.nodeType === 3 ? node.parentNode : node))
            })
        })
        observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    }
    if(document.body) isolate(document.body)
}
const SKIP = 'bdi,script,style,textarea,input,code,pre,svg,video,canvas,[contenteditable],.settings-input__input,.search__input,.player-video,.player-subtitles,.subtitle,.subtitles'
const TECHNICAL = /(?:https?:\/\/|www\.)[^\s<>\u0590-\u08ff]+|(?:[A-Za-z0-9][A-Za-z0-9._:/?=&%#@+~\-]*)(?: [A-Za-z0-9][A-Za-z0-9._:/?=&%#@+~\-]*)*/g
export function isolate(root){
    if(!root || root.nodeType !== 1 || !isRTL()) return
    const inputs=[]
    if(root.matches('input,textarea'))inputs.push(root)
    if(root.querySelectorAll)inputs.push(...root.querySelectorAll('input,textarea'))
    inputs.forEach(input=>{
        if(input.hasAttribute('dir'))return
        const field=(input.type+' '+input.name+' '+(input.closest('[data-name]')?.getAttribute('data-name') || ''))
        input.dir=fieldDirection(field)
    })
    if(root.closest(SKIP))return
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false)
    const texts=[]
    while(walker.nextNode()){
        const text=walker.currentNode
        if(!text.parentElement.closest(SKIP) && /[A-Za-z0-9]/.test(text.nodeValue))texts.push(text)
    }
    texts.forEach(text=>{
        const value=text.nodeValue,fragment=document.createDocumentFragment()
        let start=0,match
        TECHNICAL.lastIndex=0
        while((match=TECHNICAL.exec(value))){
            fragment.appendChild(document.createTextNode(value.slice(start,match.index)))
            const span=document.createElement('bdi')
            span.dir='ltr';span.className='technical-ltr';span.textContent=match[0]
            fragment.appendChild(span);start=match.index+match[0].length
        }
        if(!start)return
        fragment.appendChild(document.createTextNode(value.slice(start)))
        text.parentNode.replaceChild(fragment,text)
    })
}
export function fieldDirection(name,password){
    return password || /url|password|email|server|token|api_key|hash|port|ip_address/i.test(name || '') ? 'ltr' : 'auto'
}
export default {isRTL,apply,isolate,fieldDirection}

let rtlScrollModel
// Browsers disagree on RTL scrollLeft; expose distance from the reading start.
export function scrollModel(){
    if(rtlScrollModel)return rtlScrollModel
    const box=document.createElement('div'),child=document.createElement('div')
    box.dir='rtl';box.style.cssText='position:absolute;left:-10000px;width:4px;height:1px;overflow:scroll;'
    child.style.cssText='width:8px;height:1px;';box.appendChild(child);document.body.appendChild(box)
    if(box.scrollLeft>0)rtlScrollModel='positive-descending'
    else { box.scrollLeft=1;rtlScrollModel=box.scrollLeft===0?'negative':'positive-ascending' }
    box.parentNode.removeChild(box)
    return rtlScrollModel
}
export function readScroll(element,rtl){
    if(!rtl)return element.scrollLeft
    const model=scrollModel()
    return model==='negative'?-element.scrollLeft:model==='positive-descending'?element.scrollWidth-element.clientWidth-element.scrollLeft:element.scrollLeft
}
export function writeScroll(element,distance,rtl){
    if(!rtl){element.scrollLeft=distance;return}
    const model=scrollModel()
    element.scrollLeft=model==='negative'?-distance:model==='positive-descending'?element.scrollWidth-element.clientWidth-distance:distance
}
