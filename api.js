document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const resultContainer = document.getElementById('resultContainer');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileLabel = document.querySelector('.custom-file-label');

    // Gestion du changement de fichier
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length) {
            const file = e.target.files[0];
            fileLabel.textContent = file.name;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                imagePlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!fileInput.files.length) {
            showResult('Veuillez sélectionner une image avant de lancer l\'analyse.', 'danger');
            return;
        }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('files', file);

        try {
            // Afficher le statut de chargement
            analyzeBtn.innerHTML = '<span class="loading-spinner"><i class="fas fa-spinner"></i></span> Analyse en cours...';
            analyzeBtn.disabled = true;
            
            showResult('<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Analyse de l\'image en cours...</p></div>', 'info');

            // Requete a L'API
            const response = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            displayResults(data);

        } catch (error) {
            console.error('Erreur:', error);
            showResult(`<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Échec de l'analyse: ${error.message}</div>`);
        } finally {
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyser l\'image';
            analyzeBtn.disabled = false;
        }
    });

    function displayResults(data) {
        const prediction = data.predictions[0];
        const confidencePercent = (prediction.confidence * 100).toFixed(2);
        let statusClass, statusIcon;
        
        if (prediction.class_name.toLowerCase() === 'healthy') {
            statusClass = 'success';
            statusIcon = 'check-circle';
        } else {
            statusClass = 'danger';
            statusIcon = 'exclamation-triangle';
        }
        
        const resultHTML = `
            <div class="card diagnosis-card">
                <div class="card-body">
                    <h4 class="card-title"><i class="fas fa-diagnosis"></i> Résultats du diagnostic</h4>
                    <hr>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>État :</strong></p>
                            <span class="badge badge-${statusClass} p-2">
                                <i class="fas fa-${statusIcon}"></i> ${prediction.class_name}
                            </span>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Confiance :</strong></p>
                            <div class="progress">
                                <div class="progress-bar bg-${statusClass}" 
                                     role="progressbar" 
                                     style="width: ${confidencePercent}%" 
                                     aria-valuenow="${confidencePercent}" 
                                     aria-valuemin="0" 
                                     aria-valuemax="100">
                                    ${confidencePercent}%
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <p><strong>Fichier analysé :</strong> ${prediction.filename}</p>
                    </div>
                </div>
            </div>
        `;
        
        showResult(resultHTML);
    }

    function showResult(content, type) {
        if (type) {
            resultContainer.innerHTML = `<div class="alert alert-${type}">${content}</div>`;
        } else {
            resultContainer.innerHTML = content;
        }
    }
});