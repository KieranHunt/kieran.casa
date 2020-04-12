import React, { useState, useEffect } from "react";
import { Rings } from 'svg-loaders-react'

export default () => {
	const [isLoading, setIsLoading] = useState(true);
	const [temp, setTemp] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			const response = await (await fetch("https://kieran.casa/api/weather.json")).json();
			const tempInOldMoney = response.currently.apparentTemperature;
			setTemp(Math.trunc((tempInOldMoney - 32.0) * (5 / 9)));
			setIsLoading(false);
		};
		fetchData();
	}, []);

	if (isLoading) {
		return <span><Rings stroke="" className="inline h-5 w-6 stroke-current" /></span>;
	}
	return <span>{temp}° C</span>;
};
