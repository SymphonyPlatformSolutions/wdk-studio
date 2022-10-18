package com.symphony.devsol;

import com.symphony.devsol.model.github.GitHubContent;
import com.symphony.devsol.model.github.GitHubTree;
import com.symphony.devsol.model.github.GitHubTreeNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;
import java.util.List;

@RestController
public class GitHubService {
    private final String baseUri = "https://api.github.com/repos/finos/symphony-wdk-gallery";
    private final RestTemplate restTemplate;

    public GitHubService(
        @Value("${wdk.studio.github-token}") String token,
        RestTemplateBuilder restTemplateBuilder
    ) {
        this.restTemplate = restTemplateBuilder
            .defaultHeader("Authorization", "Bearer " + token)
            .defaultHeader("Accept", MediaType.APPLICATION_JSON.toString())
            .build();
    }

    @Cacheable("gallery-categories")
    @GetMapping("/api/gallery/categories")
    public List<String> listGalleryCategories() {
        return restTemplate.getForObject(baseUri + "/git/trees/main?recursive=1", GitHubTree.class)
            .getTree().stream()
            .map(GitHubTreeNode::getPath)
            .filter(p -> p.startsWith("categories/"))
            .map(p -> p.substring(11))
            .filter(p -> p.indexOf('/') == -1)
            .toList();
    }

    @Cacheable("gallery-workflows")
    @GetMapping("/api/gallery/{category}/workflows")
    public List<String> listGalleryWorkflows(@PathVariable String category) {
        String subPath = "categories/" + category + "/";
        return restTemplate.getForObject(baseUri + "/git/trees/main?recursive=1", GitHubTree.class)
            .getTree().stream()
            .map(GitHubTreeNode::getPath)
            .filter(p -> p.startsWith(subPath))
            .map(p -> p.substring(subPath.length()))
            .filter(p -> p.endsWith(".swadl.yaml"))
            .toList();
    }

    @Cacheable("gallery-workflow-content")
    @GetMapping("/api/gallery/{category}/workflows/{workflow}/{file}")
    public String getWorkflow(@PathVariable String category, @PathVariable String workflow, @PathVariable String file) {
        String uri = baseUri + "/contents/categories/" + category + "/" + workflow + "/" + file;
        String base64Contents = restTemplate.getForObject(uri, GitHubContent.class).getContent()
            .replaceAll("\\n", "");
        return new String(Base64.getDecoder().decode(base64Contents));
    }

    @Cacheable("gallery-readme-content")
    @GetMapping("/api/gallery/readme/{category}")
    public String getReadme(@PathVariable String category) {
        String uri = baseUri + "/contents/categories/" + category + "/README.md";
        String base64Contents = restTemplate.getForObject(uri, GitHubContent.class).getContent()
            .replaceAll("\\n", "");
        return new String(Base64.getDecoder().decode(base64Contents));
    }

    @Cacheable("gallery-readme-content")
    @GetMapping("/api/gallery/readme/{category}/{workflow}")
    public String getReadme(@PathVariable String category, @PathVariable String workflow) {
        String uri = baseUri + "/contents/categories/" + category + "/" + workflow + "/README.md";
        String base64Contents = restTemplate.getForObject(uri, GitHubContent.class).getContent()
            .replaceAll("\\n", "");
        return new String(Base64.getDecoder().decode(base64Contents));
    }
}
