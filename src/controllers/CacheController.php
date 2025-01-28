<?php

namespace wolfco\craftthesauruslex\controllers;

use craft\web\Controller;
use yii\web\Response;
use Craft;
use yii\caching\TagDependency;

class CacheController extends Controller
{
    protected array|int|bool $allowAnonymous = false;

    public function actionClearCache(): ?Response
    {
        $this->requirePostRequest();
        
        TagDependency::invalidate(Craft::$app->getCache(), 'thesaurusLex');

        Craft::$app->getSession()->setNotice('Cache cleared.');

        return $this->redirect('utilities/thesaurus-lex');
    }

    
}
