// functions
let get = (x, i) => {
    reqbody.action = "get";
    reqbody.table = x;
    reqbody.page = i;
    reqbody.sql = `select * from ${x} limit ${(i-1)*50}, 50`;
    ws.send(JSON.stringify(reqbody));
    reqbody = {};
}

// init
const ws = new WebSocket ("wss://localhost:5353")
let reqbody = {};
let assoc = {};
let table = '';
let fields = {}
// table switch lictener
document.querySelectorAll('.tables').forEach((x) => {
    x.addEventListener('click', (x) => {
        get(x.target.id, 1)
        document.querySelector('#shapbtns').style.display = "inline-block";
        table = x.target.id;
        document.querySelectorAll('.data').forEach((e) => {
            if (e.id == x.target.id) {
                e.style.display = 'block'
            }
            else {
                e.style.display = "none"
            }
        })
        document.querySelectorAll('.pages').forEach((e) => {
            if (e.id == x.target.id) {
                e.style.display = 'block'
            }
            else {
                e.style.display = "none"
            }
        })
        setTimeout(()=> {document.querySelector(`#maindata #${x.target.id} div`).style.display = "block";}, 200);
    })
})

ws.onopen = () => {
    get('people', 0)
    get('access', 0)
}

// message recieve
ws.onmessage = (d) => {
    let data = JSON.parse(d.data)
    if (data.action == "assoc") {
        for (let i in data.content) {
            assoc[data.content[i].name] = data.content[i].value
        }
    }
    else if (data.action == "pages") {
        document.querySelector(`#pages #${data.table}`).innerHTML = ``;
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            document.querySelector(`#pages #${data.table}`).innerHTML += `<div class = "page" id = "page${i}">${i}</div>`;
        }
        // page switch listener
        document.querySelectorAll('#pages .page').forEach((x) => {
            x.addEventListener('click', (q) => {
                get(table, q.target.innerHTML)
            })
        })
    }
    else if (data.action == "rows") {
        fields[data.table] = []
        for (let i in data.content[0]) {
            fields[data.table].push(i);
        }
        document.querySelector(`#maindata `).innerHTML = ``;
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            for (let j in data.content[0]) {
                document.querySelector(`#maindata `).innerHTML += `<div class = "table" id="${data.table}${j}"><div class = "tablehead">${assoc[j]}</div></div>`
                
            }
            for (let j = 0; j < 50; j++) {              
                for (let q in data.content[j+50*(i-1)]) {
                    document.querySelector(`#maindata #${data.table}${q}`).innerHTML += `<div class="row" id="row${data.content[j+50*(i-1)].id}">${data.content[j+50*(i-1)][q]}</div>  `
                }
            }
        }
    }
};


// listeners
// addwindow opener listener
document.querySelector("#addbtn").addEventListener('click', () => {
    document.querySelector('#myModal #modaldata').innerHTML = ''
    for (let i in fields[table]) {
        if (fields[table][i] != 'id') {
            document.querySelector('#myModal #modaldata').innerHTML += `<div id="div${fields[table][i]}">${assoc[fields[table][i]]}: <input id = "input${fields[table][i]}" value=""></div>`;
        }
    }
    document.querySelector('#myModal').style.display = "block"
})
// add and close addwindow
document.querySelectorAll('#addclose').forEach((x) => {
    x.addEventListener('click', () => {
        x.parentNode.parentNode.parentNode.style.display = "none"
        reqbody.fields = {}
        document.querySelectorAll('#modaldata div').forEach((x) => {
            if (x.childNodes[1].value != '') {
                reqbody.fields[x.id.slice(3)] = x.childNodes[1].value
            } else {
                reqbody.fields[x.id.slice(3)] = '-'
            }
        })
        reqbody.action = "put";
        reqbody.table = table;
        reqbody.sql = `INSERT into ${table} values ((select count from ${reqbody.table} + 1) `
        for (let i in reqbody.fields) {
        reqbody.sql += `'${reqbody.fields[i]}',`
        }
        reqbody.sql = reqbody.sql.slice(0,reqbody.sql.length-1) + ');'
        ws.send(JSON.stringify(reqbody))
        reqbody = {}
    })
})
// close addwindow listener
document.querySelectorAll('#close').forEach((x) => {
    x.addEventListener('click', () => {
        x.parentNode.parentNode.parentNode.style.display = "none";
        if (video) {
            video.srcObject.getTracks().forEach((track) => {
                track.stop();
                oldcode = {data: ''}
                document.getElementById("loadingMessage").hidden = false;
            })
        }
        document.querySelector('#inputpupil').value = ''
    })

})