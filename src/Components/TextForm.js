import React, {useState} from 'react'


export default function TextForm(props) {
    const handleupclick = ()=>{
        let newText = text.toUpperCase();
        setText(newText);
        props.showAlert("Converted To Uppercase","success")
    }
    const handlelowclick = ()=>{
        // console.log('ON CLICK handlelowclick');
        let newText = text.toLowerCase();
        setText(newText);
        props.showAlert("Converted To Lowercase","success")
    }
    const handleonchange=(e)=>{
        
        setText(e.target.value);
        
    }
    const handleClearclick=(e)=>{
 
        setText(e.target.value = "");
        props.showAlert("Text Has Been Cleared","success")
    }
    const handleCopyclick=(e)=>{
        var text = document.getElementById("text");
        text.select();
        navigator.clipboard.writeText(text.value);
        props.showAlert("Text Has Been Copied","success")
    }
    const handleSpacesclick=(e)=>{
        let newText = text.split(/[ ]+/);
        setText(newText.join(" "));
        props.showAlert("Text Has Been No Spaces","success")
    }

    const[text,setText] = useState(' ');


    return (
        <>
      
        <div className="container my-3" style={{color: props.mode === 'light'?'black':'white'}}>
            <h3>{props.heading}</h3>
            <div className="mb-3">
                <textarea className="form-control" rows="8" value={text} onChange={handleonchange} style={{backgroundColor: props.mode === 'light'?'white':'#222222',color: props.mode === 'light'?'black':'white'}} id="text" ></textarea>
            </div>
            <button className='btn btn-outline-primary mx-1' onClick={handleupclick}>Convert To UpperCase</button>
            <button className='btn btn-outline-primary mx-1' onClick={handlelowclick}>Convert To LowerCase</button>
            <button className='btn btn-outline-primary mx-1' onClick={handleClearclick}>Clear Text</button>
            <button className='btn btn-outline-primary mx-1' onClick={handleCopyclick}>Copy Text</button>
            <button className='btn btn-outline-primary mx-1' onClick={handleSpacesclick}>Remove Extra Spaces</button>
        </div>
        <div className="container my-3" style={{color: props.mode === 'light'?'black':'white'}}>
            <h4>Your Text Summary</h4>
            <p>{text.length===0?0: text.split(" ").length} Words & {text.length} Characters</p>
            <p>{text.length===0?0:0.008 * text.split(" ").length} Minutes to Read</p>
            <h4 className='text-center '>Preview</h4>
            <p>{text.length>0?text:"Enter Your Text To Preview Here"}</p>
        </div>
        
        </>

    )
}
