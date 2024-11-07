import { get, set, ref, push, onValue, query, orderByChild, limitToLast, serverTimestamp, off, onChildAdded } from 'firebase/database';
import { firebaseDatabase as db } from '@/libs/firebase';
import { Message } from '@/types';

export function useRoom() {
    // Create or join a room
    const createOrJoinRoom = async (userId: string, roomId: string) => {
        const roomRef = ref(db, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) {
            await set(roomRef, {
                name: roomId,
                participantsRef: `participants/${roomId}`,
                messagesRef: `messages/${roomId}`
            });
        }
        await addParticipant(userId, roomId);
    };

    // Add a participant to a room
    const addParticipant = (userId: string, roomId: string): Promise<void> => {
        const participantsRef = ref(db, `participants/${roomId}/${userId}`);
        return set(participantsRef, true);
    }

    // Fetch participants for a room (sets up a listener and returns unsubscribe function)
    const getParticipants = (roomId: string, callback: (participants: string[]) => void): () => void => {
        const participantsRef = ref(db, `participants/${roomId}`);
        const listener = onValue(participantsRef, (snapshot) => {
            const participantsData = snapshot.val();
            callback(participantsData ? Object.keys(participantsData) : []);
        }, { onlyOnce: true });

        // Return cleanup function to remove listener
        return () => off(participantsRef, 'value', listener);
    };

    const onParticipantAdd = (roomId: string, callback: (participant: string) => void): () => void => {
        const participantsRef = ref(db, `participants/${roomId}`);
        const listener = onChildAdded(participantsRef, (snapshot) => {
            const participant = snapshot.key;
            callback(participant as string);
        });

        // Return cleanup function to remove listener
        return () => off(participantsRef, 'child_added', listener);
    }

    // Fetch messages for a room (sets up a listener and returns unsubscribe function)
    const getMessages = (roomId: string, callback: (messages: Message[]) => void): () => void => {
        const messagesRef = ref(db, `messages/${roomId}`);
        const queryRef = query(messagesRef, orderByChild('timestamp'));
        const listener = onValue(queryRef, (snapshot) => {
            const messagesData = snapshot.val();
            callback(messagesData ? Object.values(messagesData) : []);
        }, { onlyOnce: true });

        // // Return cleanup function to remove listener
        return () => off(queryRef, 'value', listener);
    };


    // Fetch messages for a room (sets up a listener and returns unsubscribe function)
    const onMessageAdd = (roomId: string, callback: (message: Message) => void): () => void => {
        const messagesRef = ref(db, `messages/${roomId}`);
        const queryRef = query(messagesRef, orderByChild('timestamp'), limitToLast(1));
        const listener = onChildAdded(queryRef, (snapshot) => {
            const messagesData = snapshot.val();
            callback(messagesData);
        });

        // Return cleanup function to remove listener
        return () => off(queryRef, 'child_added', listener);
    };

    // Send a message to a room
    const sendMessage = (roomId: string, message: Message): Promise<void> => {
        const messagesRef = ref(db, `messages/${roomId}`);
        const newMessageRef = push(messagesRef);

        return set(newMessageRef, {
            ...message,
            timestamp: serverTimestamp()
        });
    };

    return {
        createOrJoinRoom,
        addParticipant,
        getParticipants,
        sendMessage,
        getMessages,
        onMessageAdd,
        onParticipantAdd,
    };
}
