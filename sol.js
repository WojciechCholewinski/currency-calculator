document.getElementById("calculateBtn").addEventListener("click", function () {
	const effectiveDate = document.getElementById("effective-date").value;
	const mode = document.querySelector('input[name="mode"]:checked').value;
	const inputCurrencyCode = document.getElementById(
		"input-currency-code"
	).value;
	const outputCurrencyCode = document.getElementById(
		"output-currency-code"
	).value;
	const amount = document.getElementById("input-amount").value;

	if (effectiveDate) {
		let fetchPromises = [];

		if (inputCurrencyCode !== "PLN") {
			fetchPromises.push(
				fetch(
					`https://api.nbp.pl/api/exchangerates/rates/C/${inputCurrencyCode}/${effectiveDate}`
				).then(response => response.json())
			);
		} else {
			fetchPromises.push(Promise.resolve({ rates: [{ [mode]: 1 }] }));
		}

		if (outputCurrencyCode !== "PLN") {
			fetchPromises.push(
				fetch(
					`https://api.nbp.pl/api/exchangerates/rates/C/${outputCurrencyCode}/${effectiveDate}`
				).then(response => response.json())
			);
		} else {
			fetchPromises.push(Promise.resolve({ rates: [{ [mode]: 1 }] }));
		}
		/////
		document.getElementById("error").textContent = "";

		Promise.all(fetchPromises)
			.then(data => {
				const inputRate =
					inputCurrencyCode !== "PLN" ? data[0].rates[0][mode] : 1;
				const outputRate =
					outputCurrencyCode !== "PLN" ? data[1].rates[0][mode] : 1;
				const result = (amount * inputRate) / outputRate;
				document.getElementById(
					"output-amount"
				).textContent = `${result.toFixed(2)} ${outputCurrencyCode}`;
				////
				document.getElementById("error").textContent = "";
			})
			.catch(error => {
				console.error("Error:", error);
				document.getElementById("error").textContent =
					"Błąd podczas pobierania kursów walut.";
			});
	} else {
		document.getElementById("error").textContent = "Proszę wybrać datę.";
	}
});

function updateCurrencyOptions(selectElement, rates) {
	selectElement.innerHTML = "";

	// Dodaj PLN jako opcję
	const plnOption = document.createElement("option");
	plnOption.value = "PLN";
	plnOption.textContent = "PLN";
	selectElement.appendChild(plnOption);

	rates.forEach(rate => {
		const option = document.createElement("option");
		option.value = rate.code;
		option.textContent = ` ${rate.code}`;
		selectElement.appendChild(option);
	});
}

document
	.getElementById("effective-date")
	.addEventListener("change", function () {
		const effectiveDate = this.value;
		if (effectiveDate) {
			//////
			document.getElementById("error").textContent = "";
			fetch(`https://api.nbp.pl/api/exchangerates/tables/C/${effectiveDate}`)
				.then(response => response.json())
				.then(data => {
					updateCurrencyOptions(
						document.getElementById("input-currency-code"),
						data[0].rates
					);
					updateCurrencyOptions(
						document.getElementById("output-currency-code"),
						data[0].rates
					);
					///////
					document.getElementById("error").textContent = "";
				})

				.catch(error => {
					console.error("Error:", error);
				});
		} else {
			document.getElementById("error").textContent =
				"Błąd podczas pobierania kursów walut.";
			document.getElementById("error").textContent = "Proszę wybrać datę.";
		}
	});

function updateLabels(mode) {
	const inputLabel = document.getElementById("input-amount-label");
	const outputLabel = document.getElementById("output-amount-label");

	if (mode === "ask") {
		inputLabel.textContent = "Chcę dostać";
		outputLabel.textContent = "Płacę";
	} else if (mode === "bid") {
		inputLabel.textContent = "Mam";
		outputLabel.textContent = "Dostanę";
	}
}
document.querySelectorAll('input[name="mode"]').forEach(radio => {
	radio.addEventListener("change", function () {
		updateLabels(this.value);
	});
});

document.getElementById("effective-date").dispatchEvent(new Event("change"));
