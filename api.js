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
    function getRecommendation(disease) {
        const defaultRecommendation = {
            urgency: 'Basse',
            measures: ['Continuer de surveiller les plants régulièrement pour prévenir l\'apparition de maladies.'],
            products: []
        };
    
        const recommendations = {
            'Healthy': {
                urgency: 'Basse',
                measures: ['Continuer de surveiller les plants régulièrement pour prévenir l\'apparition de maladies.'],
                products: []
            },
            'Blight': {
                urgency: 'Élevée',
                measures: [
                    'Éliminer et brûler immédiatement les plants infectés pour empêcher la propagation.',
                    'Utiliser des fongicides à base de mancozèbe ou de chlorothalonil en respectant les doses recommandées.',
                    'Pour la saison suivante, opter pour la rotation des cultures avec des plantes non hôtes du champignon (haricots, manioc, etc.).',
                    'Améliorer la circulation de l\'air en espaçant mieux les plants.'
                ],
                products: [
                    { name: 'Mancozèbe (poudre)', description: 'Fongicide de contact très efficace, à pulvériser sur les feuilles.' },
                    { name: 'Bouillie Bordelaise (cuivre)', description: 'Solution naturelle, efficace en prévention et début d’infection. Appliquer en pulvérisation.' }
                ]
            },
            'Common_Rust': {
                urgency: 'Moyenne',
                measures: [
                    'Retirer et détruire les feuilles les plus atteintes pour réduire la source d\'infection.',
                    'Appliquer un fongicide à base de soufre ou de cuivre dès les premiers signes.',
                    'Éviter l\'irrigation par aspersion, car l\'eau favorise la germination des spores du champignon.',
                    'Réduire l\'humidité dans le champ en désherbant et en assurant une bonne aération.'
                ],
                products: [
                    { name: 'Soufre micronisé', description: 'Fongicide naturel, utilisé en pulvérisation foliaire. Efficace en début d\'infection.' },
                    { name: 'Bouillie Bordelaise (cuivre)', description: 'Fongicide à large spectre, utile en prévention et traitement précoce.' }
                ]
            },
        };
    
        return recommendations[disease] || defaultRecommendation;
    }

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
    
        // Appeler la fonction pour afficher les recommandations
        displayRecommendations(prediction.class_name);
    }
    
    function displayRecommendations(disease) {
        const recommendations = getRecommendation(disease);
        const recommendationContainer = document.getElementById('recommendationContainer');
        const recommendationContent = document.getElementById('recommendationContent');
    
        const productList = recommendations.products.length > 0
            ? recommendations.products.map(product => `<li><strong>${product.name}</strong>: ${product.description}</li>`).join('')
            : '<li>Aucun produit spécifique recommandé pour l\'instant.</li>';
    
        recommendationContent.innerHTML = `
            <div class="card recommendation-card mt-4">
                <div class="card-body">
                    <h4 class="card-title text-center mb-4"><i class="fas fa-hand-holding-heart text-success"></i> Recommandations et plan d'action</h4>
                    
                    <div class="alert alert-warning text-center" role="alert">
                        <h5 class="alert-heading"><i class="fas fa-exclamation-triangle"></i> Niveau d'Urgence : <span class="font-weight-bold">${recommendations.urgency}</span></h5>
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <div class="recommendation-section">
                                <h6><i class="fas fa-tasks text-primary"></i> Mesures de Contrôle Immédiates</h6>
                                <ul>
                                    ${recommendations.measures.map(measure => `<li>${measure}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="recommendation-section">
                                <h6><i class="fas fa-spray-can text-success"></i> Produits de Traitement Suggérés</h6>
                                <ul class="list-unstyled">
                                    ${productList}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <hr>
                    
                    <div class="recommendation-section">
                        <h6><i class="fas fa-shield-alt text-info"></i> Conseils de Sécurité et Prévention</h6>
                        <p><strong>Porter des équipements de protection</strong> : Toujours utiliser des gants, un masque et des lunettes de protection lors de la manipulation de produits chimiques.</p>
                        <p><strong>Suivre les dosages</strong> : Respecter strictement les instructions et les dosages indiqués sur l'emballage des produits pour garantir l'efficacité et la sécurité.</p>
                        <p><strong>Stockage</strong> : Conserver les produits chimiques hors de portée des enfants et des animaux, dans un endroit frais et sec.</p>
                    </div>
                </div>
            </div>
        `;
    
        recommendationContainer.style.display = 'block';
    }
});