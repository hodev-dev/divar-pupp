import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { nanoid } from 'nanoid'
import __cities from './CityData';
const electron = window.require('electron');

const Group = () => {
    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState('');
    const [number, setNumber] = useState('');
    const [phones, setPhones] = useState([]);

    useEffect(() => {
        electron.ipcRenderer.send('get:groups');
        electron.ipcRenderer.on('get:groups', (event, payload) => {
            setGroups(payload.groups);
            setGroup(payload.groups[1]);
        });
    }, [])

    useEffect(() => {
        electron.ipcRenderer.send('get:phones');
        electron.ipcRenderer.on('get:phones', (event, _phones) => {
            setPhones(() => {
                console.log('phones updated', _phones);
                return Object.assign({}, _phones);
            });
        });
    }, []);

    const handleGroup = (e) => {
        setGroup(e.target.value);
    }

    const handleGroupNumber = (e) => {
        setNumber(e.target.value);
    }

    const handleResetReq = (_phone) => {
        electron.ipcRenderer.send('reset:phone', _phone);
    }

    const addPhone = () => {
        const _phone = {
            id: nanoid(),
            number: number,
            group: group,
            isActive: false,
            activateTime: Date.now(),
            req: 0,
            time: ''
        };
        electron.ipcRenderer.send('add:phone', _phone);
        electron.ipcRenderer.send('get:phones');
    };

    const deletePhone = (_phone) => {
        electron.ipcRenderer.send('delete:phone', _phone);
        electron.ipcRenderer.send('get:phones');
    }

    const loginPhone = (_phone) => {
        electron.ipcRenderer.send('login:phone', group, _phone);
    }

    const openStore = () => {
        electron.ipcRenderer.send('open:store');
    }

    const renderGroups = () => {
        return groups.filter(group => group !== 'default').map((group) => {
            return (
                <option key={group} value={group} className='flex w-full h-auto p-4 border bg-zinc-800'>
                    {group}
                </option>
            )
        })
    };

    const renderPhones = () => {
        return phones && Object.keys(phones).map((key) => {
            return (
                <div key={phones[key].number} className='flex items-center justify-between w-full h-16 p-4 text-gray-300 border divide-x-2 border-zinc-900 divide-zinc-700 bg-zinc-700'>
                    <div className='w-3/12 text-center'>
                        {phones[key].number}
                    </div>
                    <div className='w-2/12 text-center '>
                        {phones[key].group}
                    </div>
                    <div className='w-2/12 text-center '>
                        {phones[key].req}
                    </div>
                    <div onClick={() => handleResetReq(phones[key])} className='w-4/12 text-center cursor-pointer'>
                        {'ریست'}
                    </div>
                    <div onClick={() => loginPhone(phones[key])} className='w-4/12 text-center cursor-pointer'>
                        {'ورود به حساب'}
                    </div>
                    <div onClick={() => deletePhone(phones[key])} className='w-4/12 text-center text-red-400 cursor-pointer'>
                        {'حذف'}
                    </div>
                </div>
            )
        });
    }

    return (
        <div className='w-full h-auto min-h-screen gap-5 text-gray-300 bg-zinc-800' dir='rtl'>
            <div className='flex items-center w-full h-16 gap-5 bg-zinc-700'>
                <input onChange={handleGroupNumber} placeholder="شماره موبایل" className='flex items-center justify-center w-4/12 h-12 p-2 mr-5 text-left text-gray-300 border rounded border-zinc-900 bg-zinc-800 placeholder:text-center' />
                <select onChange={handleGroup} className='flex items-center w-2/12 h-12 text-center border border-zinc-900 bg-zinc-800'>
                    {renderGroups()}
                </select>
                <button onClick={addPhone} className='flex items-center justify-center w-2/12 h-12 bg-green-900 rounded '>افزودن شماره</button>
                <button onClick={openStore} className='flex items-center justify-center w-2/12 h-12 bg-blue-900 rounded '>باز کردن پوشه</button>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300' dir='ltr'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>شماره ها</h1>
            </div>
            <div className='w-full h-auto bg-zinc-800'>
                {renderPhones()}
            </div>
        </div>
    )
}

export default Group