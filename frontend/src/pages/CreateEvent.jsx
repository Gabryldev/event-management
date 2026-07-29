import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaChair,
  FaArrowRight
} from "react-icons/fa";

import api from "../api/axios";


const CreateEvent = () => {

const navigate = useNavigate();


const [form,setForm] = useState({
title:"",
description:"",
category:"Music",
venue:"",
address:"",
startDate:"",
endDate:"",
price:0,
seatingType:"general",
capacity:100,
rows:5,
cols:10
});


const [flyer,setFlyer] = useState(null);
const [preview,setPreview] = useState(null);
const [loading,setLoading] = useState(false);
const [error,setError] = useState("");



const update=(key,value)=>{
setForm({
...form,
[key]:value
});
};



const handleImage=(e)=>{

const file=e.target.files[0];

if(file){

setFlyer(file);
setPreview(URL.createObjectURL(file));

}

};



const submit=async(e)=>{

e.preventDefault();

setLoading(true);


try{

const data=new FormData();


Object.entries(form).forEach(([k,v])=>{
data.append(k,v);
});


if(flyer){
data.append("flyer",flyer);
}



const res=await api.post(
"/events",
data,
{
headers:{
"Content-Type":"multipart/form-data"
}
}
);



navigate(`/events/${res.data.data._id}`);


}catch(err){

setError(
err.response?.data?.message ||
"Failed creating event"
);

}finally{

setLoading(false);

}

};




return (

<div className="min-h-screen bg-slate-100 py-10 px-4">


<div className="
max-w-7xl
mx-auto
">


{/* HEADER */}

<div className="mb-12">

<p className="text-blue-600 font-semibold uppercase tracking-widest">
Organizer Dashboard
</p>

<h1 className="text-4xl font-bold text-slate-800 mt-2">
Create New Event
</h1>

<p className="text-slate-500 mt-2">
Fill in the details below to publish your event.
</p>
</div>





<div className="
grid
lg:grid-cols-3
gap-8
">



{/* FORM */}

<form
onSubmit={submit}
className="
lg:col-span-2
bg-white
rounded-2xl
shadow-xl
p-8
space-y-6

"
>



{error &&
<div className="
bg-red-500/20
p-3
rounded-xl
text-red-300
">
{error}
</div>
}





{/* IMAGE */}
{/* IMAGE */}

<div>
  <h2 className="text-xl font-semibold mb-4">
    Event Cover
  </h2>

  <label
    className="
      h-52
      border-2
      border-dashed
      border-gray-300
      rounded-2xl
      flex
      items-center
      justify-center
      cursor-pointer
      hover:border-blue-500
      hover:bg-blue-50
      transition
    "
  >
   {preview ? (
  <img
    src={preview}
    alt="Preview"
    className="w-full h-full object-cover rounded-2xl"
  />
) : (
  <div className="text-center">
    <FaCloudUploadAlt className="text-5xl mx-auto text-blue-600" />
    <p className="mt-3 text-gray-400">
      Upload event poster
    </p>
  </div>
)}
    <input
      hidden
      type="file"
      accept="image/*"
      onChange={handleImage}
    />
  </label>
</div>



{/* DETAILS */}




{/* DETAILS */}

<div>
  <h2 className="text-xl font-semibold mb-5">
    Event Details
  </h2>

  <div className="space-y-4">

    <input
      type="text"
      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      placeholder="Event name"
      value={form.title}
      onChange={(e) => update("title", e.target.value)}
    />

    <textarea
      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
      placeholder="Tell people about your event"
      value={form.description}
      onChange={(e) => update("description", e.target.value)}
    />

    <div className="grid md:grid-cols-2 gap-4">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder="Category"
        value={form.category}
        onChange={(e) => update("category", e.target.value)}
      />

      <input
        type="number"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder="Ticket price"
        value={form.price}
        onChange={(e) => update("price", e.target.value)}
      />
    </div>

  </div>
</div>

{/* LOCATION */}

<div>

<h2 className="text-xl font-semibold mb-5 flex gap-2">
<FaMapMarkerAlt/>
Location
</h2>


<div className="space-y-4">


<input
className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
placeholder="Venue"
value={form.venue}
onChange={(e)=>update("venue",e.target.value)}
/>



<input
className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
placeholder="Address"
value={form.address}
onChange={(e)=>update("address",e.target.value)}
/>


</div>

</div>








{/* DATE */}

<div>

<h2 className="text-xl font-semibold mb-5 flex gap-2">
<FaCalendarAlt/>
Schedule
</h2>


<div className="grid md:grid-cols-2 gap-4">


<input
className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
type="datetime-local"
value={form.startDate}
onChange={(e)=>update("startDate",e.target.value)}
/>



<input
className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
type="datetime-local"
value={form.endDate}
onChange={(e)=>update("endDate",e.target.value)}
/>


</div>

</div>


<div>
  <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
    <FaChair />
    Seating
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    <select
      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
      value={form.seatingType}
      onChange={(e) => update("seatingType", e.target.value)}
    >
      <option value="general">General</option>
      <option value="reserved">Reserved</option>
    </select>

    <input
      type="number"
      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
      placeholder="Capacity"
      value={form.capacity}
      onChange={(e) => update("capacity", e.target.value)}
    />

    {form.seatingType === "reserved" && (
      <>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Rows"
          value={form.rows}
          onChange={(e) => update("rows", e.target.value)}
        />

        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Columns"
          value={form.cols}
          onChange={(e) => update("cols", e.target.value)}
        />
      </>
    )}

  </div>
</div>


{/* BUTTON */}

<button
disabled={loading}
className="
w-full
bg-blue-600
hover:bg-blue-700
text-white
font-bold
py-4
rounded-2xl
flex
justify-center
items-center
gap-3
transition
"
>


{loading?
"Publishing..."
:
<>
Publish Event
<FaArrowRight/>
</>
}


</button>


</form>









{/* LIVE PREVIEW */}


<div className="
bg-white
rounded-2xl
shadow-xl
p-6
h-fit
sticky
top-24
">


<h2 className="
text-xl
font-semibold
mb-5
">
Live Preview
</h2>



<div className="
bg-slate-50
rounded-2xl
overflow-hidden
">


{
preview?
<img
src={preview}
className="
w-full
h-52
object-cover
"
/>
:
<div className="
h-52
flex
items-center
justify-center
text-slate-500
">
No poster
</div>
}



<div className="p-5">


<h3 className="text-2xl font-bold">
{form.title || "Your Event Name"}
</h3>


<p className="text-gray-400 mt-3">
{form.venue || "Event Venue"}
</p>


<div className="
mt-4
flex
items-center
gap-2
text-blue-600
">

<FaTicketAlt/>

£{form.price}

</div>


</div>


</div>


</div>



</div>

</div>

</div>

);

};


export default CreateEvent;