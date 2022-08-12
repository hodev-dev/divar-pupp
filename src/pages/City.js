import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { nanoid } from 'nanoid'
import __cities from './CityData';
const electron = window.require('electron');

const City = () => {
    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState('');
    const [number, setNumber] = useState('');
    const [phones, setPhones] = useState([]);
    const [cities, setCities] = useState([]);
    const [count, setCount] = useState(100);
    const [selectedProvince, setSelectedPRovince] = useState(891);
    const [selectedCity, setSelectedCity] = useState(0);

    useEffect(() => {
        electron.ipcRenderer.send('get:groups');
        electron.ipcRenderer.send('get:cities');
        electron.ipcRenderer.on('get:groups', (event, payload) => {
            setGroups(payload.groups);
            setGroup(payload.groups[0]);
        });
        electron.ipcRenderer.on('get:cities', (event, cities) => {
            setCities(cities);
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

    const handleSetCount = (e) => {
        setCount(e.target.value);
    }

    const handleSelectedProvince = (e) => {
        setSelectedPRovince(e.target.value)
    }

    const handleSelectedCity = (e) => {
        setSelectedCity(e.target.value)
    }

    const handleAddCity = () => {
        const getProvince = __cities.find((_city) => _city.id == selectedProvince);
        const getCity = getProvince.children.find((_city) => _city.id == selectedCity);
        const payload = { ...getCity, count: count };
        electron.ipcRenderer.send('add:city', payload);
    }

    const deleteCity = (_city) => {
        electron.ipcRenderer.send('delete:city', _city);
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

    const renderGroups = () => {
        return groups.map((group) => {
            return (
                <option key={group} value={group} className='flex w-full h-auto p-4 border border-zinc-900 bg-zinc-800'>
                    {group}
                </option>
            )
        })
    };

    const renderProvinceOptions = () => {
        return __cities.map((_city) => {
            return (
                <option key={_city.name} value={_city.id} className='flex w-full h-auto p-4 border border-zinc-900 bg-zinc-800'>
                    {_city.name}
                </option>
            )
        });
    }

    const renderCitiesOptions = () => {
        const getProvince = __cities.find((_city) => _city.id == selectedProvince);
        return getProvince.children.map((_city) => {
            if (!_city.isProvince) {
                return (
                    <option key={_city.name} value={_city.id} className='flex w-full h-auto p-4 border border-zinc-900 bg-zinc-800'>
                        {_city.name}
                    </option>
                )
            }
        });
    }

    const renderPhones = () => {
        return phones && Object.keys(phones).map((key) => {
            return (
                <div key={phones[key].number} className='flex items-center justify-between w-full h-16 p-4 border divide-x-2 border-zinc-900 bg-zinc-800'>
                    <div className='w-4/12 text-center'>
                        {phones[key].id}
                    </div>
                    <div className='w-3/12 text-center'>
                        {phones[key].number}
                    </div>
                    <div className='w-2/12 text-center '>
                        {phones[key].group}
                    </div>
                    <div className='w-2/12 text-center '>
                        {phones[key].req}
                    </div>
                    <div className='w-4/12 text-center '>
                        {(phones[key].isActive) ? "فعال" : 'غیره فعال'}
                    </div>
                    <div onClick={() => handleResetReq(phones[key])} className='w-4/12 text-center text-blue-700 cursor-pointer'>
                        {'ریست'}
                    </div>
                    <div onClick={() => loginPhone(phones[key])} className='w-4/12 text-center text-blue-700 cursor-pointer'>
                        {'ورود به حساب'}
                    </div>
                    <div onClick={() => deletePhone(phones[key])} className='w-4/12 text-center text-red-700 cursor-pointer'>
                        {'حذف'}
                    </div>
                </div>
            )
        });
    }

    const renderCities = () => {
        return cities && cities.map((city) => {
            return (
                <div key={city.id} className='flex items-center justify-between w-full h-16 p-4 text-gray-300 border border-zinc-900 bg-zinc-700' dir='rtl'>
                    <div className='w-4/12 text-center'>
                        {city.id}
                    </div>
                    <div className='w-4/12 text-center'>
                        {city.slug}
                    </div>
                    <div className='w-4/12 text-center'>
                        {city.name}
                    </div>
                    <div className='w-4/12 text-center'>
                        {city.count}
                    </div>
                    <div onClick={() => deleteCity(city)} className='w-4/12 text-center text-red-400 cursor-pointer'>
                        {'حذف'}
                    </div>
                </div>
            )
        });
    }


    return (
        <div className='w-full h-auto min-h-screen gap-5 bg-zinc-800' dir='rtl'>
            <div className='flex items-center w-full h-16 gap-5 border border-zinc-900 bg-zinc-700'>
                <input onChange={handleSetCount} placeholder="تعداد" className='flex items-center justify-center w-2/12 h-12 p-2 mr-5 text-black text-white border rounded border-zinc-900 bg-zinc-800 placeholder:text-center' />
                <select onChange={handleSelectedProvince} className='flex items-center w-2/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800'>
                    {renderProvinceOptions()}
                </select>
                <select onChange={handleSelectedCity} className='flex items-center w-2/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800'>
                    {renderCitiesOptions()}
                </select>
                <button onClick={handleAddCity} className='flex items-center justify-center w-2/12 h-12 text-white bg-green-900 rounded'>افزودن شهر</button>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300' dir='ltr'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>شهر ها</h1>
            </div>
            <div className='w-full h-auto '>
                {renderCities()}
            </div>
        </div>
    )
}

export default City