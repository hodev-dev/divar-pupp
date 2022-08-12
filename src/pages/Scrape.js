import React, { useEffect, useState } from 'react'
import { VscDebugRestart } from "react-icons/vsc";
import { Offline, Online } from "react-detect-offline";

import Countdown from 'react-countdown';

const electron = window.require('electron');

const Scrape = () => {
    const [groups, setGroups] = useState([]);
    const [configState, setConfigState] = useState({ delay: 5000 });
    const [posts, setPosts] = useState([]);
    const [phones, setPhones] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [done, setDone] = useState(0);
    const [notDone, setNotDone] = useState(0);
    const [worker, setWorker] = useState({});
    const [timer, setTimer] = useState(Date.now());
    const [isConnect, setIsConnect] = useState(true);

    useEffect(() => {
        electron.ipcRenderer.send('get:config');
        electron.ipcRenderer.send('get:phones');
        electron.ipcRenderer.send('get:groups');
        electron.ipcRenderer.send('get:posts');
        electron.ipcRenderer.send('worker:status');
        electron.ipcRenderer.on('get:config', (event, _config) => {
            console.log(_config);
            setConfigState(_config);
        });
        electron.ipcRenderer.on('worker:timer', (event, _time) => {
            setTimer(_time);
        });
        electron.ipcRenderer.on('worker:status', (event, _payload) => {
            setIsStarted(_payload.state);
            setWorker(_payload);
        });
        electron.ipcRenderer.on('get:groups', (event, _payload) => {
            setGroups(_payload.groups);
            if (_payload.groups.length > 1) {
                setSelectedGroup(_payload.groups[1]);
            }
        });
        electron.ipcRenderer.on('get:posts', (event, _posts) => {
            setPosts(_posts);
            const _done = _posts.filter(post => post.isDone);
            setDone(_done.length);
            setNotDone(_posts.length - _done.length);
        });
        electron.ipcRenderer.on('get:phones', (event, _phones) => {
            setPhones(_phones);
        });
    }, []);

    const handleSelectGroup = (e) => {
        setSelectedGroup(e.target.value);
    }

    const handleFetchPosts = () => {
        electron.ipcRenderer.send('fetch:posts', selectedGroup);
    };

    const handleLoadPosts = () => {
        electron.ipcRenderer.send('get:posts');
    };

    const handleCopyUrl = async (post) => {
        try {
            await navigator.clipboard.writeText(post.url);
            console.log('Page URL copied to clipboard');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    const handleGetPost = () => {
        electron.ipcRenderer.send('get:post', selectedGroup);
        setTimer(Date.now());
    }

    const handleCancel = () => {
        electron.ipcRenderer.send('cancel:post');
        setTimer(0);
    }

    const renderGroups = () => {
        return groups && groups.map((group) => {
            if (group !== 'default') {
                return <option className='text-xl' key={group}>{group}</option>;
            }
        });
    }

    const renderPosts = () => {
        if (posts.length > 0) {
            return posts.filter((post) => !post.isDone).slice(0, 3).map((post, index) => {
                return (
                    <div key={post.id} className='flex flex-row flex-wrap items-center cursor-pointer w-full h-auto min-h-[4rem] text-gray-300 border divide-x-2 border-zinc-900 bg-zinc-700 divide-zinc-700 bg-zinc-800 hover:bg-red-900' dir='rtl'>
                        <div className='flex items-center justify-center w-1/6 text-center'>{post.page}</div>
                        <div className='flex items-center justify-center w-1/6 text-center'>{post.index}</div>
                        <div onClick={() => handleCopyUrl(post)} className='flex items-center justify-center w-1/6 text-center'>{post.id}</div>
                        <div className='flex items-center justify-center w-1/6 text-center'>{(post.isDone) ? 'انجام شده' : 'انجام نشده'}</div>
                        <div className='flex items-center justify-center w-1/6 text-center'>{post.city}</div>
                    </div>
                )
            });
        } else {
            return (
                <div className='flex flex-row flex-wrap items-center w-full h-16 text-gray-300 border divide-x-2 border-zinc-900 bg-zinc-700 divide-zinc-700 bg-zinc-800' dir='rtl'>
                    <div className='flex items-center justify-center w-full text-center'>{'اگهی یافت نشد'}</div>
                </div>
            )
        }
    }

    const renderPhones = () => {
        if (phones.length > 0) {
            return phones.filter((phone) => phone.group == selectedGroup).map((post, index) => {
                return (
                    <div key={post.id} className='flex flex-row flex-wrap items-center w-full h-[4rem] text-gray-300 bg-zinc-700' dir='rtl'>
                        <div className='flex items-center justify-center w-1/6 text-center'>{index + 1}</div>
                        <div className='flex items-center justify-center w-1/6 h-16 text-center'>{post.id}</div>
                        <div className='flex items-center justify-center w-1/6 h-16 text-center'>{post.group}</div>
                        <div className='flex items-center justify-center w-1/6 h-16 text-center'>{post.number}</div>
                        <div className='flex items-center justify-center w-1/6 h-16 text-center'>{post.req}</div>
                    </div>
                )
            });
        } else {
            return (
                <div className='flex flex-row flex-wrap items-center w-full h-auto min-h-[4rem] text-gray-300 border divide-x-2 border-zinc-900 bg-zinc-800 divide-zinc-700 bg-zinc-800' >
                    رکوردی وجود ندارد
                </div>
            )
        }
    }

    return (
        <div className='flex flex-col w-10/12 h-auto bg-zinc-800 divide-zinc-900' >
            <Offline polling={{ url: 'https://divar.ir/s/ahvaz' }}>
                <div className='flex items-center justify-center w-full min-h-[4rem] text-gray-300 bg-red-900' dir='rtl'>
                    اینترنت قطع می باشد
                </div>
            </Offline>
            <div className='flex items-center justify-start w-full min-h-[4rem] text-gray-300 bg-zinc-700 bg-zinc-800' dir='rtl'>
                <select onChange={handleSelectGroup} className='flex items-center justify-center w-2/12 min-h-[3rem] mr-5 text-center text-gray-300 border border-zinc-900 bg-zinc-800'>
                    {renderGroups()}
                </select>
                <button className='flex items-center justify-center w-2/12 h-12 mr-5 text-center text-gray-300 border border-zinc-900 bg-zinc-800' onClick={handleFetchPosts}>دریافت لیست اگهی ها </button>
                {/* <button className='flex items-center justify-center w-2/12 h-12 mr-5 text-center text-gray-300 border border-zinc-900 bg-zinc-800' onClick={handleLoadPosts}>بارگذاری پست ها</button> */}
                {(!isStarted) ? <button disabled={(isStarted) ? true : false} className='flex items-center justify-center w-2/12 h-12 mr-5 text-center text-gray-300 bg-green-900 border border-zinc-900 disabled:bg-red-600' onClick={handleGetPost}>دریافت شماره اگهی ها</button> : null}
                {(isStarted) ? <button className='flex items-center justify-center w-2/12 h-12 mr-5 text-center text-gray-300 bg-red-900 border border-zinc-900' onClick={handleCancel}>توقف عملیات</button> : null}
            </div>
            {worker.state == true ? <div className='flex flex-wrap items-center w-full h-auto divide-y-2 bg-zinc-800 divide-zinc-900'>
                <h1 className='flex items-center justify-end w-full h-16 mr-5 text-gray-300 '>وضعیت</h1>
                <div className='flex flex-row flex-wrap items-center w-full h-auto min-h-[4rem] text-gray-300 border divide-x-2 border-zinc-900 bg-cyan-900 divide-zinc-700 ' dir='rtl'>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'صفحه'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'شماره'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'تکرار'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'شهر'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'وضعیت'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'تایمر'}</div>
                </div>
                <div className='flex flex-row flex-wrap items-center w-full h-auto min-h-[4rem] text-gray-300 border divide-x-2 border-zinc-800 bg-cyan-800 divide-zinc-700 ' dir='rtl'>
                    <div className='flex items-center justify-center w-1/6 text-center'>{worker.page}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{worker.index}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{worker.retry}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{worker.city}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{worker.msg}</div>
                    <Countdown key={timer} autoStart={true} className='flex items-center justify-center w-1/6 text-center' date={timer + Number(configState.delay)} />
                </div>
            </div> : null}
            <div className='flex flex-wrap items-center w-full h-auto divide-y-2 divide-zinc-900'>
                <div className='flex items-center justify-between w-full' dir='rtl'>
                    <h1 className='flex items-center justify-start w-full h-16 mr-5 text-gray-300 '>آمار</h1>
                    <div className='flex items-center justify-end w-2/12 h-12 ml-5 text-gray-300 select-none'>
                        <VscDebugRestart className='cursor-pointer' size={25} onClick={handleLoadPosts} />
                    </div>
                </div>
                <div className='flex flex-row flex-wrap items-center w-full h-auto min-h-[4rem] text-gray-300 border divide-x-2 border-zinc-900 bg-zinc-800 divide-zinc-700 ' dir='rtl'>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'انجام شده'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'انجام نشده'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'تعداد کل'}</div>
                </div>
                <div className='flex flex-row flex-wrap items-center w-full h-auto min-h-[4rem] text-gray-300 border divide-x-2 border-zinc-900 bg-zinc-700 divide-zinc-700 ' dir='rtl'>
                    <div className='flex items-center justify-center w-1/6 text-center'>{done}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{notDone}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{posts && posts.length}</div>
                </div>
            </div>
            <div className='flex flex-wrap items-center w-full h-auto divide-y-2 divide-zinc-900'>
                <h1 className='flex items-center justify-end w-full h-16 mr-5 text-gray-300 '>شماره ها</h1>
                <div className='flex flex-row flex-wrap items-center w-full h-auto min-h-[4rem] text-gray-300 border divide-x-2 border-zinc-900 bg-zinc-800 divide-zinc-700 ' dir='rtl'>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'ردیف'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'ایدی'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'گروه'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'شماره'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'تعداد درخواست'}</div>
                </div>
                {renderPhones()}
            </div>
            <div className='flex flex-wrap items-center w-full h-auto'>
                <h1 className='flex items-center justify-end w-full h-16 mr-5 text-gray-300'>اگهی ها</h1>
                <div className='flex flex-row flex-wrap items-center w-full h-auto min-h-[4rem] text-gray-300 border divide-x-2 border-zinc-900 bg-zinc-800 divide-zinc-700 ' dir='rtl'>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'صفحه'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'شماره'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'ایدی'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'وضعیت'}</div>
                    <div className='flex items-center justify-center w-1/6 text-center'>{'شهر'}</div>
                </div>
                {renderPosts()}
            </div>
        </div>
    )
}

export default Scrape