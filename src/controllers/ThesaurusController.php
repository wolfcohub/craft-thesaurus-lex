<?php

namespace wolfco\thesaurus\controllers;

use craft\web\Controller;
use yii\web\Response;
use Craft;

class ThesaurusController extends Controller
{
    protected array|int|bool $allowAnonymous = true;

    public function actionGetSynonyms(): Response
    {
        $this->requirePostRequest();
        $word = Craft::$app->getRequest()->getBodyParam('word');

        if (!$word) {
            return $this->asJson(['error' => 'No word provided']);
        }

        // Thesaurus API key and request
        $apiKey = '***REMOVED***';
        $apiUrl = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/{$word}?key={$apiKey}";

        $response = file_get_contents($apiUrl);
        $data = json_decode($response, true);

        if (isset($data['error'])) {
            return $this->asJson(['error' => 'Could not retrieve thesaurus data.']);
        }

        return $this->asJson($data);
    }
    public function actionGetDefinitions(): Response
    {
        $this->requirePostRequest();
        $word = Craft::$app->getRequest()->getBodyParam('word');

        if (!$word) {
            return $this->asJson(['error' => 'No word provided']);
        }

        // Dictionary API key and request
        $apiKey = '***REMOVED***';
        $apiUrl = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/{$word}?key={$apiKey}";

        $response = file_get_contents($apiUrl);
        $data = json_decode($response, true);

        if (isset($data['error'])) {
            return $this->asJson(['error' => 'Could not retrieve dictionary data.']);
        }

        return $this->asJson($data);
    }
}
