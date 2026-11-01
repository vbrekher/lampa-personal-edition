import Notice from '../notice/notice'
import Account from '../../core/account/account'
import Manifest from '../../core/manifest'
import Lang from '../../core/lang'
import Utils from '../../utils/utils'

/**
 * Показать уведомление о продлении премиум-статуса
 * @returns {void}
 */
function init(){
    if(Account.Permit.access && window.lampa_settings.account_use){
        if(Account.Permit.user.premium && !Account.hasPremium()) setTimeout(push,5000)
    }
}

function push(){
    let now = new Date()
    let id  = 'extend_premium_' + now.getFullYear() + '_' + now.getMonth()
    
    if(Notice.classes.lampa.notices.find(n=>n.id == id)) return

    let notice = {
        id,
        from: 'cub',
        title: {i18n_key: 'premium_renew_title'},
        text: {i18n_key: 'premium_renew_text'},
        time: Date.now(),
        icon: Utils.protocol() + Manifest.cub_domain+'/img/icons/premium_two.svg'
    }

    Notice.pushNotice('lampa',notice, ()=>{
        
    },(er)=>{
        
    })
}

export default {
    init
}
