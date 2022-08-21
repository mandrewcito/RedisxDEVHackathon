import axios from 'axios'

const url = `${process.env.REACT_APP_API_URL}`

const ApiService = {
    getGraph: () => axios.get(`${url}/graph/wallets`),
    getWalletSenderGraph: (wallet) => axios.get(`${url}/graph/wallets?sender=${wallet}`),
    getWalletReceiverGraph: (wallet) => axios.get(`${url}/graph/wallets?receiver=${wallet}`),
    getStocks:() => axios.get(`${url}/stock/current`),
    getTopWalletsSenders: () => axios.get(`${url}/topk/wallets/senders`),
    getTopWalletsReceivers: () => axios.get(`${url}/topk/wallets/receivers`),
    getBars: (coin, barType) => axios.get(`${url}/stats/bars/${coin}/${barType}`),
    getChainBars: (barType) => axios.get(`${url}/stats/chain/${barType}`),
    getStockSeries: (coin)=>axios.get(`${url}/stats/bars/${coin}/all`),
    getStreamVolume: () => axios.get(`${url}/stats/chain/tx`),
    getStreamBtc: () => axios.get(`${url}/stats/chain/btc`),
    getWallet:(wallet) =>axios.get(`${url}/wallets/${wallet}`)
}

export default ApiService;