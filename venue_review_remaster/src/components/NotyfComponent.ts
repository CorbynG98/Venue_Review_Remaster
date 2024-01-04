import { Notyf } from 'notyf';

const notyf = new Notyf({
    duration: 5000,
    position: {
        x: 'right',
        y: 'top',
    },
    types: [
        {
            type: 'success',
            backgroundColor: '#28a745',
            icon: {
                className: 'notyf__icon--success',
                tagName: 'i',
            },
        },
        {
            type: 'warning',
            backgroundColor: '#ffc107',
            icon: {
                className: 'notyf__icon--error',
                tagName: 'i',
            },
        },
        {
            type: 'danger',
            backgroundColor: '#dc3545',
            icon: {
                className: 'notyf__icon--error',
                tagName: 'i',
            },
        },
    ],
})

export default notyf;