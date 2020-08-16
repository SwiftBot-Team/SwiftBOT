module.exports = {
    createOptionHandler(structureName, structureOptions, options = {}) {
        if (!options.optionalOptions && typeof options === 'undefined') {
            throw new Error(`A opção da estrutura "${structureName}" é obrigatória.`)
        }

        return ({
            optional(name, defaultValue = null) {
                const value = structureOptions[name]

                return typeof value === 'undefined'
                    ? defaultValue
                    : value
            },

            required(name) {
                const value = structureOptions[name]

                if (typeof value === 'undefined') {
                    throw new Error(`A opção "${name}" da estrutura "${structureName}" é obrigatória.`)
                }
                return value
            }
        })
    },

    convertHourToMinutes(time) {
        const [hour, minutes] = time.split(':').map(Number);
        const timeInMinutes =  (hour * 60) + minutes;
        
        return timeInMinutes;
    },

    msToTime(duration) {
        let minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24) -3;
      
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
      
        return hours + ":" + minutes;
    }
}