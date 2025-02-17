export const getPassengerLabel = (count) => {
    if (count % 10 === 1 && count % 100 !== 11) {
        return `${count} пассажир`;
    }
    else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        return `${count} пассажира`;
    }
    else {
        return `${count} пассажиров`;
    }
};
