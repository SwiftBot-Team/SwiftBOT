module.exports = new class Converter {
    romanToDecimal(text) {
        const guide = {
            'M': 1000,
            'D': 500,
            'C': 100,
            'L': 50,
            'X': 10,
            'V': 5,
            'I': 1
        };

        const order = ['M', 'D', 'C', 'L', 'X', 'V', 'I'];

        text = text.toUpperCase();

        let dec = 0;

        while (text.length > 0) {
            let sym1 = text[0];

            text = text.substring(1);

            if (text.length > 0) {
                let sym2 = text[0];

                if (order.indexOf(sym1) > order.indexOf(sym2)) {
                    text = text.substring(1);
                    dec += guide[sym2] - guide[sym1];
                } else {
                    dec += guide[sym1];
                }
            } else {
                dec += guide[sym1];
            }
        }

        return dec;
    }

    decimalToRoman(num) {
        if (isNaN(num))
            return NaN;
        var digits = String(+num).split(""),
            key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
                "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
                "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        return Array(+digits.join("") + 1).join("M") + roman;
    }
}