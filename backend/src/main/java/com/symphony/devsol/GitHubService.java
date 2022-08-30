package com.symphony.devsol;

import com.symphony.devsol.model.github.GitHubContent;
import com.symphony.devsol.model.github.GitHubTree;
import com.symphony.devsol.model.github.GitHubTreeNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
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
        @Value("${bdk.studio.github-token}") String token,
        RestTemplateBuilder restTemplateBuilder
    ) {
        this.restTemplate = restTemplateBuilder
            .defaultHeader("Authorization", "Bearer " + token)
            .defaultHeader("Accept", MediaType.APPLICATION_JSON.toString())
            .build();
    }

    @GetMapping("/gallery/categories")
    public List<String> listGalleryCategories() {
        return restTemplate.getForObject(baseUri + "/git/trees/main?recursive=1", GitHubTree.class)
            .getTree().stream()
            .map(GitHubTreeNode::getPath)
            .filter(p -> p.startsWith("categories/"))
            .map(p -> p.substring(11))
            .filter(p -> p.indexOf('/') == -1)
            .toList();
    }

    @GetMapping("/gallery/{category}/workflows")
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

    @GetMapping("/gallery/{category}/workflows/{workflow}")
    public String getWorkflow(@PathVariable String category, @PathVariable String workflow) {
        String uri = baseUri + "/contents/categories/" + category + "/" + workflow;
        String base64Contents = restTemplate.getForObject(uri, GitHubContent.class).getContent().replaceAll("\\n", "");
        return new String(Base64.getDecoder().decode(base64Contents));
    }
}
