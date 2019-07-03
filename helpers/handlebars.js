module.exports = {
    selectSkills: (selecteds = [], options) => {
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        let html = '';
        skills.forEach(skill => {
            html += `
                <li ${selecteds.includes(skill) ? 'class="activo"': ''}>${skill}</li>
            `;
        });
        return options.fn().html = html;
    },
    typeContract: (selected, options) => {
        return options.fn(this).replace(
            new RegExp(` value="${selected}"`), '$& selected="selected"'
        );
    },
    showAlerts: (errors = {}, alerts) => {
        const category = Object.keys(errors);
        let html = '';
        if (category.length) {
            errors[category].forEach(err => {
                let msg = (err.hasOwnProperty('msg')) ? err.msg : err;
                html += `<div class="${category} alerta">
                    ${msg}
                </div>`;
            })
        }
        return alerts.fn().html = html;
    }
}