export default function checkComb(res) {
// function checkComb(res) {

    //     const res = [9, 2, 4, 5]
    const possibleOutcomes = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
        [3, 5, 7],
        [1, 5, 9]
    ]

    // console.log(possibleOutcomes)

    const compare = (a1, a2) => {
        // console.log(a1, a2)
        var count = 0;
        for (var i = 0; i < a1.length; i++) {
            // console.log(i, 'a[i]')
            for (var j = 0; j < a2.length; j++)
                if (a1[i] == a2[j]) {
                    // console.log(a2[i], 'of res', a1[i], 'of po' )
                    count++
                }
        }
        if (count == 3) {
            // console.log(true, 'compare')
            return true;
        } else
            if (a2.length == 5)
                return 'draw'
            else
                return false;
    }

    res.sort();
    for (var i = 0; i < possibleOutcomes.length; i++) {
        // console.log(i)
        if (res.length >= 3 && compare(possibleOutcomes[i], res) == true) {
            // console.log(true, 'inside if');
            return true;
        }
    }
    if (res.length == 5)
        return 'draw';
    return false;
}

// console.log(checkComb([1, 3, 4, 8, 9]))