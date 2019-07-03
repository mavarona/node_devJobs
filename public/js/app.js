import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');
    let alerts = document.querySelector('.alertas');
    if (alerts) {
        cleanAlerts();
    }
    if (skills) {
        skills.addEventListener('click', addSkills);
        skillsSelecteds();
    }

    const offersList = document.querySelector('.panel-administracion');
    if (offersList) {
        offersList.addEventListener('click', actionsOffersList);
    }
});
const skills = new Set();
const addSkills = e => {
    if (e.target.tagName === 'LI') {
        if (e.target.classList.contains('activo')) {
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    const arrSkills = [...skills];
    document.querySelector('#skills').value = arrSkills;
}

const skillsSelecteds = () => {
    const selecteds = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));
    selecteds.forEach(selected => {
        skills.add(selected.textContent);
    });
    const arrSkills = [...skills];
    document.querySelector('#skills').value = arrSkills;
}

const cleanAlerts = () => {
    let alerts = document.querySelector('.alertas');
    if (alerts.children.length > 0) {
        const interval = setInterval(() => {
            if (alerts.children.length === 0) {
                alerts.parentElement.removeChild(alerts);
                clearInterval(interval);
            } else {
                alerts.removeChild(alerts.children[0])
            }
        }, 2000);
    }
}

const actionsOffersList = e => {
    e.preventDefault();
    if (e.target.dataset.delete) {

        Swal.fire({
            title: 'Confirmar eliminación?',
            text: "Una vez eliminada no se podrá recuperar",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar',
            cancelButtonText: 'No, Cancelar'
        }).then((result) => {
            if (result.value) {
                const url = `${location.origin}/offers/delete/${e.target.dataset.delete}`;
                axios.delete(url, {
                    params: {
                        url
                    }
                }).then(function(response) {
                    if (response.status === 200) {
                        Swal.fire(
                            'Eliminado',
                            response.data,
                            'success'
                        )
                    }
                    e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                }).catch(() => {
                    Swal.fire({
                        type: 'Error',
                        title: 'Hubo un error',
                        text: 'No se pudo eliminar'
                    })
                });
            }
        })
    } else if (e.target.tagName === 'A') {
        window.location.href = e.target.href;
    }
}