
const clientId = Math.floor(new Date().getTime() / 1000);

const url = `${process.env.REACT_APP_WS_URL}/${clientId}`   
const ws = new WebSocket(url)

const service = {
    suscriptions: [],
    connection: ws,
    suscribe: (fn) => {},
    unsuscribe: (fn) => {}
}

ws.onmessage = (e) => {
    for (const fn of service.suscriptions)
        fn(e);
} 

service.suscribe = (fn) => service.suscriptions.push(fn)
service.unsuscribe = (fn) => service.suscriptions = service.suscriptions.filter(o => o !== fn);

export default service