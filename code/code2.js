function connectWS() {
    ws=new WebSocket("ws://localhost:8000/echo");
    console.log("Connection : "+ws.url);

    ws.onmessage=(event) => {
        // console.log("data : "+event.data);
        const obj=JSON.parse(event.data);
        checkCommand(obj.cmd, obj.param)
    }
    ws.onopen=(event) => {s
        console.log("onopen : "+JSON.stringify(event));
        sendLogin();
    }
    ws.onclose=(event) => {
        console.log("onclose : code("+event.code+"), reason("+event.reason+")");
    }
}

function sendLogin() {
    const data=JSON.stringify({ "cmd": 1, "param": { "Username": "innovative", "Password": "xxxxxxxxx" } })
    ws.send(data);
}

function checkCommand(cmd, payload) {
    // console.log({ cmd, payload })
    if (cmd==1) {
        // res.LoginResult
        if (payload.Success==1) {
            ws.send(JSON.stringify({
                cmd: 32,
                param: {},
            })
            );
        }
        console.log("Login :"+(payload.Success==1? "Success":"Failed"));
    } else if (cmd==31) {
        const { Ctrl, Device, Member, V }=payload
        console.log({ Ctrl, Device, Member, V })
        const dev=devicesList.find(dev => dev.gateway_id==Member&&dev.device_id==Device);
        if (dev!=null) {
            if (dev.device_style==3) {
                if (Ctrl==0) {
                    // online-offline
                    dev.controls[0].last_value=V
                    const onlineStatus=document.getElementById(`onlineStatus${Member}${Device}`)
                    if (onlineStatus) {
                        if (V==0) {
                            onlineStatus.innerHTML=`                               
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-red-500"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>`;
                        } else {
                            onlineStatus.innerHTML=`                               
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-500"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>`;
                        }
                        const elements=[
                            document.getElementById(`btnPowerOn${device.gateway_id}${device.device_id}`),
                            document.getElementById(`btnPowerOff${device.gateway_id}${device.device_id}`),
                            document.getElementById(`rangeBrightness${device.gateway_id}${device.device_id}`),
                        ]
                        const validElements=elements.filter(el => el!==null);
                        if (validElements.length>0) {
                            validElements.forEach(element => {
                                V==0? element.disabled=true:element.disabled=false;
                            });
                        }
                    }
                } else if (Ctrl==1) {
                    // bright
                    if (dev.controls[1].last_value!=V) {
                        dev.controls[1].last_value=V;
                        const activeColor="#3b82f6";
                        const inactiveColor="#374151";
                        const elements=[
                            document.getElementById(`bright${Member}${Device}`),
                            document.getElementById(`rangeBrightnessValue${Member}${Device}`),
                            document.getElementById(`rangeBrightness${Member}${Device}`),
                        ];
                        const validElements=elements.filter(el => el!==null);
                        if (validElements.length>0) {
                            validElements.forEach(element => {
                                element.innerText=V;
                                element.value=V
                                const ratio=(element.value-element.min)/(element.max-element.min)*100;
                                element.style.background=`linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
                            })
                        }
                    }
                } else if (Ctrl==2) {
                    // status
                    dev.controls[2].last_value=V;
                    const elements=[
                        document.getElementById(`power${Member}${Device}`),
                        document.getElementById(`label${Member}${Device}`)
                    ]
                    const validElements=elements.filter(el => el!==null);
                    if (validElements.length>0) {
                        validElements.forEach(element => {
                            if (V==0) {
                                element.innerText='OFF';
                                updateClass(element, 'text-green-500', 'text-red-500');
                            } else {
                                element.innerText='ON';
                                updateClass(element, 'text-red-500', 'text-green-500');
                            }
                        });
                    }
                } else if (Ctrl==10) {
                    const batt=dev.controls.find(d => d.control_id==Ctrl)
                    if (batt) {
                        batt.last_value=V
                        const percentage=document.getElementById(`percentage${Member}${Device}`)
                        if (percentage) {
                            percentage.innerText=V
                        }
                    }
                } else if (Ctrl==11) {
                    const temp=dev.controls.find(d => d.control_id==Ctrl)
                } else if (Ctrl==12) {
                    const charge=dev.controls.find(d => d.control_id==Ctrl)
                    if (charge) {
                        charge.last_value=V;
                        const chargeing=document.getElementById(`charge${Member}${Device}`);
                        if (chargeing) {
                            V==0? updateClass(chargeing, 'block', 'hidden'):updateClass(chargeing, 'hidden', 'block');
                        }
                    }
                } else if (Ctrl==13) {
                    const powerVolt=dev.controls.find(d => d.control_id==Ctrl)
                    if (powerVolt) {
                        powerVolt.last_value=V;
                        const labelPowerVolt=document.getElementById(`powerVolt${Member}${Device}`)
                        if (labelPowerVolt) {
                            const value=(V/10).toFixed(2);
                            labelPowerVolt.innerText=value;
                        }
                    }
                } else if (Ctrl==14) {
                    const powerCurrent=dev.controls.find(d => d.control_id==Ctrl)
                    if (powerCurrent) {
                        const labelPowerCurrent=document.getElementById(`powerCurrent${Member}${Device}`)
                        if (labelPowerCurrent) {
                            const value=(V/1000).toFixed(2);
                            labelPowerCurrent.innerText=value;
                        }
                    }
                } else if (Ctrl==15) {
                    const powerOutVolt=dev.controls.find(d => d.control_id==Ctrl)
                } else if (Ctrl==16) {
                    const powerOutCurrent=dev.controls.find(d => d.control_id==Ctrl)
                }
            }
        }
    } else if (cmd==9) {
        // gateway status
        const { MemberID, Status }=payload
        const device=devicesList.find(d => d.type=='gateway'&&d.gateway_id==MemberID);
        device.status=Status;
        let lableGatewayStatus=document.getElementById(`gateway_status${MemberID}`);
        if (lableGatewayStatus) {
            if (Status==0) {
                lableGatewayStatus.innerText='Offline';
                updateClass(lableGatewayStatus, 'text-green-500', 'text-red-500');
                document.getElementById(`onlineStatus${MemberID}`).innerHTML=`                               
                         <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-red-500"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>`;
            } else {
                lableGatewayStatus.innerText='Online';
                updateClass(lableGatewayStatus, 'text-red-500', 'text-green-500');
                document.getElementById(`onlineStatus${MemberID}`).innerHTML=`                               
                         <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-500"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>`;
            }
        }
    } else if (cmd==34) {
        // res.friendinformation
        const { Member }=payload;
        devicesList.forEach(device => {
            if (device.type=='gateway') {
                const id=String(device.gateway_id)
                device.status=Member[id].Status;
                if (Member[id].Status==0) {
                    document.getElementById(`gateway_status${id}`).innerText='Offline';
                    updateClass(document.getElementById(`gateway_status${id}`), 'text-green-500', 'text-red-500');
                    document.getElementById(`onlineStatus${id}`).innerHTML=`                               
                         <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-red-500"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>`;
                } else {
                    document.getElementById(`gateway_status${id}`).innerText='Online';
                    updateClass(document.getElementById(`gateway_status${id}`), 'text-red-500', 'text-green-500');
                    document.getElementById(`onlineStatus${id}`).innerHTML=`                               
                         <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-500"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>`;
                }
            }
        })
    } else if (cmd==99) {
        // reject command
        const { Status, Message }=payload
        if (Status==0) {
            const content=`<p>${Message}</p>`
            showModalPopup(content, false)
        }

    }
}