const pickupDeliveryModal=document.getElementById("pickupDeliveryModal");
const pickupBtn=document.getElementById("pickupBtn");
const deliveryBtn=document.getElementById("deliveryBtn");
const mapContainer=document.getElementById("mapContainer");
const addressContainer=document.getElementById("addressContainer");
const deliveryTimeContainer=document.getElementById("deliveryTimeContainer");
const checkoutForm=document.getElementById("checkoutForm");
const receiptEl=document.getElementById("receipt");

const cName=document.getElementById("cName");
const cEmail=document.getElementById("cEmail");
const cPhone=document.getElementById("cPhone");

const orders=JSON.parse(sessionStorage.getItem("orders")||"[]");
const mealCount=parseInt(sessionStorage.getItem("mealCount")||"0");
const plan=sessionStorage.getItem("plan")||"";
const planData=JSON.parse(sessionStorage.getItem("planData")||"{}");

const foodTruckAddress="Riversoljax Food Truck, 8350 Baymeadows Rd, Jacksonville, FL 32256";
const googleMapsLink=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodTruckAddress)}`;
const appleMapsLink=`https://maps.apple.com/?q=${encodeURIComponent(foodTruckAddress)}`;

function isAppleDevice(){return /iPhone|iPad|iPod/.test(navigator.userAgent);}

function showAddress(type){
    pickupDeliveryModal.style.display="none";
    
    const locationHTML=`<span class="location_icon"><i class="fa fa-map-marker"></i></span>
    <a href="${isAppleDevice() ? 'javascript:void(0)' : googleMapsLink}" target="_blank" id="addressLink">${foodTruckAddress}</a>`;
    
    if(type==="Pickup"){
        addressContainer.style.display="none";
        deliveryTimeContainer.style.display="none";
        mapContainer.innerHTML=`<p style="margin-bottom:0.5rem;">Food Truck Location:</p>
        <div class="address_display">${locationHTML}</div>
        <div class="schedule_box"><b>Schedule</b><br><br>
        Sunday — 6:30am - 11:00am<br>
        Monday — 6:30am - 3pm<br>
        Tuesday — 6:30am - 3pm<br>
        Wednesday — 6:30am - 3pm<br>
        Thursday — 7am - 3pm<br>
        Friday — 7am - 3pm<br>
        Saturday — Closed
        </div>`;
    } else {
        addressContainer.style.display="block";
        deliveryTimeContainer.style.display="block";
        mapContainer.innerHTML=`<p style="margin-bottom:0.5rem;">Delivery available within 10 miles of:</p>
        <div class="address_display">${locationHTML}</div>`;
    }

    if(isAppleDevice()){
    const addressLinkEl = document.getElementById("addressLink");
    addressLinkEl.addEventListener("click",(e)=>{
        e.preventDefault();

        const oldModal=document.getElementById("mapChoiceModal");
        if(oldModal) oldModal.remove();

        const modalHTML=document.createElement("div");
        modalHTML.id="mapChoiceModal";
        modalHTML.style.position="fixed";
        modalHTML.style.top="0";
        modalHTML.style.left="0";
        modalHTML.style.width="100%";
        modalHTML.style.height="100%";
        modalHTML.style.background="rgba(0,0,0,0.5)";
        modalHTML.style.display="flex";
        modalHTML.style.justifyContent="center";
        modalHTML.style.alignItems="center";
        modalHTML.style.zIndex="9999";

        modalHTML.innerHTML=`
        <div style="background:white;padding:1.8rem 2rem;border-radius:16px;text-align:center;max-width:300px;width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.2);position:relative;">
            
            <span id="closeMapModal" style="position:absolute;top:10px;right:14px;font-size:20px;font-weight:700;cursor:pointer;">×</span>

            <p style="font-weight:600;margin-bottom:1rem;font-size:1rem;">Open in:</p>

            <button id="openAppleMaps" style="padding:0.8rem 1.2rem;margin:0.5rem;width:100%;border:none;border-radius:12px;background:#e5e5e5;color:black;font-weight:600;font-size:1rem;cursor:pointer;">Apple Maps</button>

            <button id="openGoogleMaps" style="padding:0.8rem 1.2rem;margin:0.5rem;width:100%;border:none;border-radius:12px;background:#e5e5e5;color:black;font-weight:600;font-size:1rem;cursor:pointer;">Google Maps</button>

        </div>
        `;

        document.body.appendChild(modalHTML);

        document.getElementById("openAppleMaps").addEventListener("click",()=>{
            window.open(appleMapsLink,"_blank");
            modalHTML.remove();
        });

        document.getElementById("openGoogleMaps").addEventListener("click",()=>{
            window.open(googleMapsLink,"_blank");
            modalHTML.remove();
        });

        document.getElementById("closeMapModal").addEventListener("click",()=>{
            modalHTML.remove();
        });
    });
}

    checkoutForm.dataset.type=type;
    renderReceipt();
}

window.onload=()=>pickupDeliveryModal.style.display="flex";
pickupBtn.addEventListener("click",()=>showAddress("Pickup"));
deliveryBtn.addEventListener("click",()=>showAddress("Delivery"));

function renderReceipt(){
let subtotal=0;
receiptEl.innerHTML=`<p><b>Order Type:</b> ${checkoutForm.dataset.type}</p>
<p><b>Plan:</b> ${plan}</p>
<p><b>Meals:</b> ${mealCount}</p>
<p><b>Combinations:</b> ${orders.length}</p>
<hr>`;
orders.forEach((combo,i)=>{
receiptEl.innerHTML+=`<p><b>Combo ${i+1}</b><br>`;
for(const key in combo){
if(combo[key].length>0) receiptEl.innerHTML+=`${key}: ${combo[key].join(", ")}<br>`;
if(key==="Protein"){const extraPrices={Steak:3.5,Salmon:3.5,Shrimp:2,Bison:2,Carnitas:2};
subtotal+=combo[key].reduce((acc,val)=>acc+(extraPrices[val]||0),0)*(mealCount===10?mealCount/2:mealCount);}
if(key==="Extras") subtotal+=combo[key].length*1.5*(mealCount===10?mealCount/2:mealCount);}
receiptEl.innerHTML+="</p>";});
const basePrice=mealCount===10?planData[plan].price10:planData[plan].price5;
subtotal+=basePrice;
const tax=subtotal*0.075;
receiptEl.innerHTML+=`<p>Subtotal: $${subtotal.toFixed(2)}</p><p>Taxes (+7.5%): $${tax.toFixed(2)}</p><p><b>Total: $${(subtotal+tax).toFixed(2)}</b></p>`;

// Professional validation for phone formatting
cPhone.addEventListener("input",(e)=>{
let x=e.target.value.replace(/\D/g,'').substring(0,10);
let formatted="";
if(x.length>0) formatted="("+x.substring(0,3);
if(x.length>=4) formatted+=") "+x.substring(3,6);
if(x.length>=7) formatted+="-"+x.substring(6,10);
e.target.value=formatted;
});
}

checkoutForm.addEventListener("submit",(e)=>{
e.preventDefault();
let allFilled=true;
const requiredFields=["cName","cEmail","cPhone"];

if(checkoutForm.dataset.type==="Delivery"){
    requiredFields.push("cStreet");
    requiredFields.push("cCity");
    requiredFields.push("cState");
    requiredFields.push("cZip");
    requiredFields.push("deliveryTime");
}

requiredFields.forEach(id=>{
const el=document.getElementById(id);
if(!el.value.trim()||(id==="cPhone" && el.value.trim().length!==14)){
el.classList.add("invalid");
el.scrollIntoView({behavior:"smooth",block:"center"});
allFilled=false;}else{el.classList.remove("invalid");}});

if(!allFilled)return;
alert("Order placed successfully! (Payment placeholder)");
});
