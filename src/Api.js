import { useEffect, useState } from 'react';

const useBalanceApi= (setErrorCode) =>{

    const [balance, setBalance] = useState(false);
    const [address, setAddress] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            console.log('getBalance:'+address);
            if(address.length===0){
                return;
            }
            setErrorCode(false);
            try{
                let rawResp = await fetch(`http://localhost:3000/balance?address=${address}`);
                let resp = await rawResp.json();
                console.log(resp);
                if (resp.errorCode) {
                    setErrorCode(resp.errorCode);
                } else if (resp.balance) {
                    setBalance(resp.balance)
                } else {
                    setErrorCode(-1);
                }
            }catch(ex){
                setErrorCode(-1);
            }
        };

        fetchData();
    }, [address, setErrorCode]);

    return [{ balance}, setAddress]
}

const useMintApi= (setErrorCode, handleNext) => {

    const [amount, setAmount] = useState(1);
    const [address, setAddress] = useState("");

    const setData = (addr, value) =>{
        setAddress(addr);
        setAmount(value);
    }
    useEffect(() => {
        const fetchData = async () => {
            console.log('getMint:'+address+','+amount);
            if(address.length===0){
                return;
            }
            setErrorCode(false);
            try{
                let rawResp = await fetch(`http://localhost:3000/mint?address=${address}&amount=${amount}`);
                let resp = await rawResp.json();
                console.log(resp);
                if (resp.errorCode) {
                    setErrorCode(resp.errorCode)
                } else if (resp.mint) {
                    handleNext(address);
                } else {
                    setErrorCode(-1);
                }
            }catch(ex){
                setErrorCode(-1);
            }
        };

        fetchData();
    }, [address, amount, handleNext, setErrorCode]);

    return [ setData]
}

export {useBalanceApi,useMintApi}