import { get, set, ref, push, onValue, onChildAdded, onChildChanged, off, Query, query, orderByChild, limitToLast, serverTimestamp, equalTo } from 'firebase/database';
import { firebaseDatabase as db } from '@/libs/firebase';
import { Message, Participant } from '@/types';

export function useRoom() {
    // Store the active listeners to clean up later
    const activeListeners: Record<string, { listener: () => void, roomId: string }> = {};

    const cleanupListeners = () => {
        // Loop through each listener and call cleanup
        Object.values(activeListeners).forEach(listenerObj => {
            listenerObj.listener();  // Cleanup listener
        });
        // Clear the active listeners record after cleanup
        Object.keys(activeListeners).forEach(key => delete activeListeners[key]);
    };

    // Create or join a room
    const createOrJoinRoom = async (username: string, lang: string, room: string) => {
        const roomRef = ref(db, 'rooms');
        const roomQuery = query(roomRef, orderByChild('name'), equalTo(room.toLowerCase()));
        const snapshot = await get(roomQuery);
    
        let roomId: string;
        
        if (snapshot.exists()) {
            roomId = Object.values<{ id: string }>(snapshot.val())[0].id;
        } else {
            const newRoomRef = push(roomRef);
            roomId = newRoomRef.key as string;
            await set(newRoomRef, {
                id: roomId,
                name: room.toLowerCase(),
                participantsRef: `participants/${roomId}`,
                messagesRef: `messages/${roomId}`
            });
        }
    
        await addParticipant(username, lang, roomId);
        return roomId;
    };

    // Add a participant to a room
    const addParticipant = (userId: string, lang: string, roomId: string): Promise<void> => {
        const participantsRef = ref(db, `participants/${roomId}`);
        const newParticipantRef = push(participantsRef);
        return set(newParticipantRef, { id: newParticipantRef.key, name: userId, lang });
    };

    // General function to add a listener for a given event
    const addListener = <T>(
        roomId: string,
        eventType: string,
        callback: (data: T) => void,
        queryRef: Query,
        listenerType: 'value' | 'child_added' | 'child_changed'
    ) => {
        // Generate a unique key for each listener (based on roomId and eventType)
        const listenerKey = `${roomId}_${eventType}`;

        // Check if listener already exists for the roomId and eventType
        if (activeListeners[listenerKey]) {
            console.log(`Listener for ${listenerKey} already exists.`);
            return;
        }

        // Add the listener
        const listener = listenerType === 'value'
            ? onValue(queryRef, snapshot => callback(snapshot.val() || {}), { onlyOnce: true })
            : listenerType === 'child_added'
                ? onChildAdded(queryRef, snapshot => callback(snapshot.val()))
                : onChildChanged(queryRef, snapshot => callback(snapshot.val()));

        // Store the listener and its cleanup function
        activeListeners[listenerKey] = {
            listener: () => off(queryRef, listenerType, listener), // Store cleanup function
            roomId
        };
    };

    const getParticipants = (roomId: string, callback: (participants: Record<string, Participant>) => void): void => {
        const participantsRef = ref(db, `participants/${roomId}`);
        const queryRef = query(participantsRef);
        addListener(roomId, 'participants', callback, queryRef, 'value');
    };

    const onParticipantAdd = (roomId: string, callback: (participant: Participant) => void): void => {
        const participantsRef = ref(db, `participants/${roomId}`);
        const queryRef = query(participantsRef, limitToLast(1));
        addListener(roomId, 'participant_add', callback, queryRef, 'child_added');
    };

    const getMessages = (roomId: string, callback: (messages: Record<string, Message>) => void): void => {
        const messagesRef = ref(db, `messages/${roomId}`);
        const queryRef = query(messagesRef, orderByChild('timestamp'));
        addListener(roomId, 'messages', callback, queryRef, 'value');

        // get(queryRef).then(snapshot => {
        //     const messagesData = snapshot.val();
        //     callback(messagesData || {});
        // });
    };

    const onMessageAdd = (roomId: string, callback: (message: Message) => void): void => {
        const messagesRef = ref(db, `messages/${roomId}`);
        const queryRef = query(messagesRef, orderByChild('timestamp'), limitToLast(1));
        addListener(roomId, 'message_add', callback, queryRef, 'child_added');
    };

    const onMessageChange = (roomId: string, callback: (message: Message) => void): void => {
        const messagesRef = ref(db, `messages/${roomId}`);
        const queryRef = query(messagesRef, orderByChild('timestamp'), limitToLast(1));
        addListener(roomId, 'message_change', callback, queryRef, 'child_changed');
    };

    // Send a message to a room
    const sendMessage = async (roomId: string, message: Message) => {
        const messagesRef = ref(db, `messages/${roomId}`);
        const newMessageRef = push(messagesRef);
        const id = newMessageRef.key as string;

        await set(newMessageRef, {
            ...message,
            id,
            timestamp: serverTimestamp()
        });
        return id;
    };

    const updateMessage = async (roomId: string, messageId: string, message: Message) => {
        const messageRef = ref(db, `messages/${roomId}/${messageId}`);
        await set(messageRef, message);
    };

    return {
        createOrJoinRoom,
        addParticipant,
        getParticipants,
        sendMessage,
        updateMessage,
        getMessages,
        onMessageAdd,
        onParticipantAdd,
        onMessageChange,
        cleanupListeners, // Expose cleanup function
    };
}
