'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { socket } from '@socket';
import { useEffect, useState } from 'react';
import { SocketContext } from '@shared/utils/contexts/SocketContext';
export const SocketProvider = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        const onConnect = () => { };
        const onDisconnect = () => {
            console.log('Socket disconnected');
        };
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        if (!socket.connected) {
            socket.connect();
            setIsReady(true);
        }
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect();
        };
    }, []);
    return (_jsx(SocketContext.Provider, { value: isReady ? socket : null, children: children }));
};
