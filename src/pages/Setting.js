import React, { useEffect, useState } from 'react'
const electron = window.require('electron');

const Setting = () => {
    const [config, setConfig] = useState({
        delay: 0,
        req: 0,
        retry: 3,
        contactButtonXPath: '/html/body/div/div[1]/div/div[1]/div[2]/button[1',
        contactButtonWait: 0,
        contactButtonConfirmCssSelector: '.test'
    });


    useEffect(() => {
        electron.ipcRenderer.send('get:config');
        electron.ipcRenderer.on('get:config', (event, config) => {
            setConfig(config);
        });
    }, []);


    const handleSetConfig = (e) => {
        setConfig((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSaveConfig = () => {
        electron.ipcRenderer.send('set:config', config);
    };

    return (
        <div className='flex flex-col items-center w-10/12 h-auto min-h-screen divide-y-2 item bg-zinc-800 divide-zinc-900' >
            <div className='flex flex-row items-center justify-start w-full h-16 p-4 text-gray-300 shadow bg-zinc-700' dir='rtl'>
                <button onClick={handleSaveConfig} className='flex items-center justify-center w-2/12 h-12 ml-5 text-center text-gray-300 bg-indigo-900 border border-zinc-800' >ورود تنظیمات</button>
                <button onClick={handleSaveConfig} className='flex items-center justify-center w-2/12 h-12 ml-5 text-center text-gray-300 bg-green-900 border border-zinc-800' >ذخیره تنظیمات</button>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>وقفه بین هر درخواست</h1>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300 shadow bg-zinc-700'>
                <input onChange={handleSetConfig} value={config.delay} name={'delay'} className='flex items-center justify-end w-6/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800' />
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>زمان انتظار دکمه اطلاعات تماس</h1>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300 shadow bg-zinc-700'>
                <input onChange={handleSetConfig} value={config.contactButtonWait} name={'contactButtonWait'} className='flex items-center justify-end w-6/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800' />
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>تعداد درخواست با هر خط شماره</h1>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300 shadow bg-zinc-700'>
                <input onChange={handleSetConfig} value={config.req} name={'req'} className='flex items-center justify-end w-6/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800' />
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>تعداد تکرار در صورت وجود خطا</h1>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300 shadow bg-zinc-700'>
                <input onChange={handleSetConfig} value={config.retry} name={'retry'} className='flex items-center justify-end w-6/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800' />
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>نمایش مرورگر</h1>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300 shadow bg-zinc-700'>
                <input onChange={handleSetConfig} value={config.showBrowser} name={'showBrowser'} className='flex items-center justify-end w-6/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800' />
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>دکمه اطلاعات تماس xpath</h1>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300 shadow bg-zinc-700'>
                <input onChange={handleSetConfig} value={config.contactButtonXPath} name={'contactButtonXPath'} className='flex items-center justify-end w-6/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800' />
            </div>

            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300'>
                <h1 className='flex items-center justify-end w-full h-16 text-gray-300'>سلکتور تایید اطلاعات تماس</h1>
            </div>
            <div className='flex flex-row items-center justify-end w-full h-16 p-4 text-gray-300 shadow bg-zinc-700'>
                <input onChange={handleSetConfig} value={config.contactButtonConfirmCssSelector} name={'contactButtonConfirmCssSelector'} className='flex items-center justify-end w-6/12 h-12 text-center text-gray-300 border border-zinc-900 bg-zinc-800' />
            </div>

        </div>
    )
}

export default Setting